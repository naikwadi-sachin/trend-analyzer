var mMargin = {top: 20, right: 20, bottom: 30, left: 40},
    mWidth = 700 - mMargin.left - mMargin.right,
    mHeight = 500 - mMargin.top - mMargin.bottom;

var mX = d3.scale.ordinal()
    .rangeRoundBands([0, mWidth], .1);

var mY = d3.scale.linear()
    .rangeRound([mHeight, 0]);

var mColor = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var mXAxis = d3.svg.axis()
    .scale(mX)
    .orient("bottom");

var mYAxis = d3.svg.axis()
    .scale(mY)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var mSVG = d3.select("#stackedBarChart").append("svg")
    .attr("width", mWidth + mMargin.left + mMargin.right)
    .attr("height", mHeight + mMargin.top + mMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + mMargin.left + "," + mMargin.top + ")");

d3.csv("sample data.csv", function (error, data) {
    //console.log(data);

    convertDataFormat(data);

    //console.log(finalData);
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

    mColor.domain(d3.keys(data[0]).filter(function (key) {
        return key !== "country";
    }));

    data.forEach(function (d) {
        var y0 = 0;
        d.ages = mColor.domain().map(function (name) {
            return {name: name, y0: y0, y1: y0 += +d[name]};
        });
        d.total = d.ages[d.ages.length - 1].y1;
    });

    data.sort(function (a, b) {
        return b.total - a.total;
    });

    mX.domain(data.map(function (d) {
        return d.country;
    }));
    mY.domain([0, d3.max(data, function (d) {
        return d.total;
    })]);

    mSVG.append("g")
        .attr("class", "x1 axis")
        .attr("transform", "translate(0," + mHeight + ")")
        .call(mXAxis);

    mSVG.append("g")
        .attr("class", "y1 axis")
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
        .attr("transform", function (d) {
            return "translate(" + mX(d.country) + ",0)";
        });

    //to display country text vertically
    country.attr("transform", "rotate(-90)")

    country.selectAll("rect")
        .data(function (d) {
            return d.ages;
        })
        .enter().append("rect")
        .attr("width", mX.rangeBand())
        .attr("y", function (d) {
            return mY(d.y1);
        })
        .attr("height", function (d) {
            return mY(d.y0) - mY(d.y1);
        })
        .style("fill", function (d) {
            return mColor(d.name);
        });

    var legend = mSVG.selectAll(".legend")
        .data(mColor.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", mWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", mColor);

    legend.append("text")
        .attr("x", mWidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });

});

var finalData = [];
function convertDataFormat(data) {


    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var countryIndex = findCountryIndex(item['Country']);
        if (countryIndex < 0) {
            //country data not found, add new data
            finalData.push({country: item['Country']});
            countryIndex = finalData.length - 1;
        }

        var category = data[i]['category'];
        var val = Number(finalData[countryIndex][category]);
        if (isNaN(val)) {
            val = 0;
        }
        finalData[countryIndex][category] = val + 1;
    }
    console.log(finalData);
    finalData = finalData.slice(0, 10);
}

function findCountryIndex(country) {
    var index = -1;
    for (var i = 0; i < finalData.length; i++) {
        if (finalData[i].country == country) {
            index = i;
            break;
        }
    }
    return index;


}