function initGraph(month){

    var colorArray= {"Artwork" : "#acbbe2", "Bathroom_Accessories": "#8085c4", "Books_&_Stationery": "#3752a7", "Electronics": "#caa7d0", "Gifts": "#953b9a", "Health_and_Personal_care": "#f00080", "Home_Decor": "#f78561", "Jewellery": "#f78000", "Kitchenware": "#9bae92", "Lighting_Accessories": "#67bf3c", "Luggage_&_Travel_Gear":"#f01b16", "Toys_&_Games": "#777777"};

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var mX = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var mY = d3.scale.linear()
        .rangeRound([height, 0]);

    //create dynamic color range
    var rangeArray = [];
    for(var catIndex = 0; catIndex < selectedCategories.length; catIndex++){
        rangeArray.push(colorArray[selectedCategories[catIndex]]);
    }

    var mColor = d3.scale.ordinal()
        //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#00ff9f", "#f0ff00", "#a05d56", "#d0743c", "#ff8c00", "#ff6700"]);
        //.range(["#acbbe2", "#8085c4", "#3752a7", "#caa7d0", "#953b9a", "#f00080", "#f78561", "#f78000", "#9bae92", "#67bf3c","#f01b16", "#777777"]);
        .range(rangeArray);

    var mXAxis = d3.svg.axis()
        .scale(mX)
        .orient("bottom");

    var mYAxis = d3.svg.axis()
        .scale(mY)
        .orient("left")
        .tickFormat(d3.format(".2s"));
    d3.select("#stackedBarChart").select("svg").remove();
    var mSVG = d3.select("#stackedBarChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("barChart.json", function(error, data) {
        console.log(data);

//      convertDataFormat(data);
        var index = getIndexOfDate(data, month);
        finalData = data[index]['countryList'];//temp step
        console.log("Before:");
        console.log(finalData);
        finalData.sort(function(a, b){
            return (b["Artwork"] + b["Bathroom_Accessories"] + b["Books_&_Stationery"] + b["Electronics"] + b["Gifts"] + b["Health_and_Personal_care"] + b["Home_Decor"] + b["Jewellery"] + b["Kitchenware"] + b["Lighting_Accessories"] + b["Luggage_&_Travel_Gear"]+ b["Toys_&_Games"]) - (a["Artwork"] + a["Bathroom_Accessories"] + a["Books_&_Stationery"] + a["Electronics"] + a["Gifts"] + a["Health_and_Personal_care"] + a["Home_Decor"] + a["Jewellery"] + a["Kitchenware"] + a["Lighting_Accessories"] + a["Luggage_&_Travel_Gear"]+ a["Toys_&_Games"]) ;
        });
        console.log("After:");
        console.log(finalData);
        finalData = finalData.slice(0, 10)

        console.log(finalData);
        data = finalData;
//    data = [{
//      state: "United States",
//      Beauty: "4499890",
//      Electronics: "4114496",
//      Handmade: "3853788",
//      "Home & Decor": "2704659",
//      Music: "8819342",
//      Sports: "10604510",
//      Toy: "2159981"
//    }];

//    data = [{
//      country: "United States",
//      map: []
//      Beauty: "4499890",
//      Electronics: "4114496",
//      Handmade: "3853788",
//      "Home & Decor": "2704659",
//      Music: "8819342",
//      Sports: "10604510",
//      Toy: "2159981"
//    }];

        if (error) throw error;

        mColor.domain(d3.keys(data[0]).filter(function(key) {
                var isKey = false;
                for(var i = 0; i< selectedCategories.length; i++){
                    if(key === selectedCategories[i]){
                        isKey = true;
                        break;
                    }
                }
                return isKey;
                //return key === "artwork" || key === 'gifts';
            }
        ));

        data.forEach(function(d) {
            var y0 = 0;
            d.ages = mColor.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
            d.total = d.ages[d.ages.length - 1].y1;
        });

        data.sort(function(a, b) { return b.total - a.total; });

        mX.domain(data.map(function(d) { return d.country; }));
        mY.domain([0, d3.max(data, function(d) { return d.total; })]);

        mSVG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(mXAxis);

        mSVG.append("g")
            .attr("class", "y axis")
            .call(mYAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Population");

        var country = mSVG.selectAll(".country")
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + mX(d.country) + ",0)"; });

        country.selectAll("rect")
            .data(function(d) { return d.ages; })
            .enter().append("rect")
            .attr("width", mX.rangeBand())
            .attr("y", function(d) { return mY(d.y1); })
            .attr("height", function(d) { return mY(d.y0) - mY(d.y1); })
            .style("fill", function(d) {
                //return colorArray[d.name];
                return mColor(d.name);
            })
            .on("mousemove", function (d) {
                //console.log(d);
                var html = "";

                html += "<div class=\"tooltip_kv\">";
                html += "<span class=\"tooltip_key\">";
                html += d.name+"<br>"
                html += (d.y1 - d.y0);
                html += "</span>";
                html += "</div>";



                $("#tooltip-container").html(html);
                $(this).attr("fill-opacity", "0.7");
                $("#tooltip-container").show();

                d3.select("#tooltip-container")
                        .style("top", (d3.event.layerY + 155) + "px")
                        .style("left", (d3.event.layerX + 15) + "px");

            })
            .on("mouseout", function () {
                $(this).attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();
            });
        ;

        var legend = mSVG.selectAll(".legend")
            .data(mColor.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 50)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", mColor);

        legend.append("text")
            .attr("x", width - 56)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

    });

}


var finalData = [];
function convertDataFormat(data){


    for(var i =0; i < data.length; i++){
        var item = data[i];
        var countryIndex = findCountryIndex(item['Country']);
        if(countryIndex < 0){
            //country data not found, add new data
            finalData.push({country : item['Country']});
            countryIndex = finalData.length - 1;
        }

        var category = data[i]['category'];
        var val = Number(finalData[countryIndex][category]);
        if(isNaN(val)){
            val = 0;
        }
        finalData[countryIndex][category] = val + 1;
    }
    console.log(finalData);
    finalData = finalData.slice(0, 10);
}

function getIndexOfDate(data, month){
    var index = 0;
    for(var i =0; i < data.length; i++){
        if(data[i]["month"] === month) {
            index = i;
            break;
        }
    }
    return index;
}

function findCountryIndex(country){
    var index = -1;
    for(var i =0; i < finalData.length; i++){
        if(finalData[i].country == country){
            index = i;
            break;
        }
    }
    return index;


}
initGraph();