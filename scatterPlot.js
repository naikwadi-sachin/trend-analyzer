// Various accessors that specify the four dimensions of data to visualize.
function x(d) {
    return d.customers;
}
function y(d) {
    return d.sales;
}
function radius(d) {
    return d.products;
}
function color(d) {
    return d.categoryName;
}
function key(d) {
    return d.categoryName;
}

// Chart dimensions.
var margin = {top: 19.5, right: 10.5, bottom: 19.5, left: 45.5},
    width = 950 - margin.right,
    height = 500 - margin.top - margin.bottom;

// Various scales. These domains make assumptions of data, naturally.
//var xScale = d3.scale.log().domain([100, 100000]).range([0, width]);
//var yScale = d3.scale.linear().domain([1, 1400]).range([height, 0]);
var xScale = d3.scale.pow().exponent(.5).domain([10, 60000]).range([0, width - 240]);
var yScale = d3.scale.pow().exponent(.5).domain([1, 2000]).range([height, 0]);
var radiusScale = d3.scale.sqrt().domain([5, 300]).range([0, 25]);
var colorScale = d3.scale.category10();

// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// Create the SVG container and set the origin.
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add the x-axis.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// Add an x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width - 250)
    .attr("y", height - 6)
    .text("Total number of customers");

// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Gross Sales Amount (in Thousands)");

var startingMonth = "December-2010";
// Add the year label; the value is set on transition.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 440)
    .attr("x", width - 550)
    .text(startingMonth);


// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var trendingData;

d3.json("data.json", function (trends) {
    trendingData = trends;
    initScatterPlot("All");
});

function initScatterPlot(mon) {

    if (typeof trendingData == 'undefined') {
        return;
    }
    // A bisector since many nation's data is sparsely-defined.
    var bisect = d3.bisector(function (d) {
        return d[0];
    });

    label.text(mon);

    /*if(mon=="All"){
     yScale = d3.scale.linear().domain([1, 1400]).range([height, 0]);
     }
     else {
     yScale = d3.scale.linear().domain([1, 400]).range([height, 0]);
     }
     yAxis = d3.svg.axis().scale(yScale).orient("left");
     svg.selectAll(".y axis").remove();
     svg.append("g")
     .attr("class", "y axis")
     .call(yAxis);*/

    // Add a dot per product category. Initialize the data at December-2010, and set the colors.

    svg.selectAll(".dot").remove();

    var dot = svg.append("g")
        .attr("class", "dots")
        .selectAll(".dot")
        .data(interpolateData(mon))
        .enter().append("circle")
        .attr("class", "dot")
        .style("fill", function (d) {
            return colorArray[d.categoryName];
        })
        .on("click", function (d) {
            //console.log("clicked in circle");
            console.log(d);
        })
        .on("mouseover", function (d) {
            var html = "";

            html += "<div class=\"tooltip_kv\">";
            //html += "<span class=\"tooltip_key\">";
            html += "<b>" + d.categoryName + "</b><br/>"
            html += "Sales Amt:" + Math.floor(d.sales / 1000) + " K<br/>";
            html += "Customers:" + d.customers + "<br/>";
            html += "Products:" + d.products;
            //html += "</span>";
            html += "</div>";


            $("#tooltip-container").html(html);
            $(this).attr("fill-opacity", "0.7");
            $("#tooltip-container").show();

            d3.select("#tooltip-container")
                .style("top", (d3.event.layerY + 155) + "px")
                .style("left", (d3.event.layerX - 150) + "px");
        })
        .on("mouseout", function (d) {
            $(this).attr("fill-opacity", "1.0");
            $("#tooltip-container").hide();
        })
        .call(position)
        .sort(order);

    // Add a title.
    /* dot.append("title")
     .style("font-style", "bold")
     .text(function (d) {
     return "<b>" + d.categoryName + "</b><br/>"
     + "Sales Amt:" + d.sales + "<br/>"
     + "Customers:" + d.customers + "<br/>"
     + "Products:" + d.products;
     });*/

    // Add an overlay for the year label.
    /*var box = label.node().getBBox();

     var overlay = svg.append("rect")
     .attr("class", "overlay")
     .attr("x", box.x)
     .attr("y", box.y)
     .attr("width", box.width)
     .attr("height", box.height);*/
    //.on("mouseover", enableInteraction);

}

// Positions the dots based on data.
function position(dot) {
    dot.attr("cx", function (d) {
        return xScale(Math.round(x(d)));//show customer as it is
    })
        .attr("cy", function (d) {
            return yScale(Math.round(y(d) / 1000));//show sales amount in thousands
        })
        .attr("r", function (d) {
            return radiusScale(radius(d));
        });
}

// Defines a sort order so that the smallest dots are drawn on top.
function order(a, b) {
    return radius(b) - radius(a);
}

function showAnimation() {



    // Start a transition that interpolates the data based on year.
    //svg.transition()
    //    .duration(10000)
    //    .ease("linear")
    //    .tween("year", tweenYear(dot))
    //    .each("end", enableInteraction);
    myYear = 0;
    var currentMonth;

    var interval = setInterval(function () {
        currentMonth = yearSet[myYear];
        console.log("Displaying : " + currentMonth);

        svg.selectAll(".dot").remove();
        var dot = svg.append("g")
            .attr("class", "dots")
            .selectAll(".dot")
            .data(interpolateData(currentMonth))
            .enter().append("circle")
            .attr("class", "dot")
            .style("fill", function (d) {
                return colorArray[d.categoryName];
            })
            .call(position)
            .sort(order);

        label.text(currentMonth);
        //displayYear(dot, yearSet[myYear++]);
        myYear++;

        if (myYear == 13) {
            clearInterval(interval);
        }
    }, 900);

    function enableInteraction() {
        console.log("enableInteraction called");
    }


}

// Tweens the entire chart by first tweening the year, and then the data.
// For the interpolated data, the dots and label are redrawn.
function tweenYear(dots) {
    /*var year = d3.interpolateNumber(1, 13);
     console.log("year=" + year);
     return function (t) {
     console.log(t);
     var i = Math.round(year(t));
     console.log(i);
     console.log("show = " + yearSet[i - 1]);
     displayYear(dots, yearSet[i - 1]);
     };*/

    var t = d3.timer(function (elapsed) {
        console.log("timer called " + elapsed);
        if (elapsed > 2000) this.stop();
    }, 100);
    //t.start();
}

// Updates the display to show the specified year.
function displayYear(dot, year) {
    dot.data(interpolateData(year), key);//.call(position).sort(order);
    label.text(year);
}

// Interpolates the dataset for the given (fractional) year.
function interpolateData(year) {
    if (typeof trendingData !== 'undefined') {
        return trendingData.map(function (d) {
            //console.log(d);
            var data = {
                categoryName: d.categoryName,
//                    region: d.region,
                sales: interpolateValues("s", d.sales, year),
                customers: interpolateValues("c", d.customers, year),
                products: interpolateValues("p", d.products, year)
            };
            //console.log(data);
            if (selectedCategories.indexOf(d.categoryName) > -1)
                return data;
            else return null;
        }).filter(function (item) {
            if (item != null)
                return item;
        });
    }

}


// Interpolates the dataset for the given (fractional) year.
function interpolateDataPerCategory(year, category) {
    return trendingData.map(function (d) {
        //console.log(d);
        var data = {
            categoryName: d.categoryName,
//                    region: d.region,
            sales: interpolateValues("s", d.sales, year),
            customers: interpolateValues("c", d.customers, year),
            products: interpolateValues("p", d.products, year),
            month: year
        };
        //console.log(data);
        if (category == "All" && selectedCategories.indexOf(d.categoryName) > -1)
            return data;
        else if (data.categoryName == category)
            return data;
        else return null;
    }).filter(function (item) {
        if (item != null)
            return item;
    });
}


// Finds (and possibly interpolates) the value for the specified year.
function interpolateValues(type, values, year) {
    var val = 0;
    for (var i = 0; i < values.length; i++) {
        if (year == "All") {

            if (type == "c" || type == "s") {
                val += values[i][1];
            }
            else {
                val = values[i][1];
                break;
            }
        }
        else if (values[i][0] == year) {
            val = values[i][1];
            break;
        }
    }
    return val;
}

//show trends for a specified category over time line
function showCategoryTrends(categoryName) {
    if (typeof trendingData == 'undefined') {
        return;
    }
    svg.selectAll(".dot").remove();
    label.text("All");
    for (var i = 0; i < yearSet.length; i++) {
        var dot = svg.append("g")
            .attr("class", "dots")
            .selectAll(".dot")
            .data(interpolateDataPerCategory(yearSet[i], categoryName))
            .enter().append("circle")
            .attr("class", "dot")
            .style("fill", function (d) {
                return colorArray[d.categoryName];
            })
            .on("mouseover", function (d) {
                var html = "";

                html += "<div class=\"tooltip_kv\">";
                //html += "<span class=\"tooltip_key\">";
                html += "<b>" + d.categoryName + "</b><br/>"
                html += "Month:" + d.month + "<br/>"
                html += "Sales Amt:" + Math.floor(d.sales / 1000) + " K<br/>";
                html += "Customers:" + d.customers + "<br/>";
                html += "Products:" + d.products;
                //html += "</span>";
                html += "</div>";


                $("#tooltip-container").html(html);
                $(this).attr("fill-opacity", "0.7");
                $("#tooltip-container").show();

                d3.select("#tooltip-container")
                    .style("top", (d3.event.layerY + 155) + "px")
                    .style("left", (d3.event.layerX - 150) + "px");
            })
            .on("mouseout", function (d) {
                $(this).attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();
            })
            .call(position)
            .sort(order);

        /*dot.append("title")
         .text(function (d) {
         return "<b>" + d.categoryName + "</b><br/>"
         + "Month:" + d.month + "<br/>"
         + "Sales Amt:" + d.sales + "<br/>"
         + "Customers:" + d.customers + "<br/>"
         + "Products:" + d.products;
         });*/

    }


}