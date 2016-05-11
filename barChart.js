function initGraph(month){
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var mX = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var mY = d3.scale.linear()
        .rangeRound([height, 0]);

    var mColor = d3.scale.ordinal()
        //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#00ff9f", "#f0ff00", "#a05d56", "#d0743c", "#ff8c00", "#ff6700"]);
        .range(["#acbbe2", "#8085c4", "#3752a7", "#caa7d0", "#953b9a", "#f00080", "#f78561", "#f78000", "#9bae92", "#67bf3c","#f01b16", "#777777"]);

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
            .style("fill", function(d) { return mColor(d.name); });

        var legend = mSVG.selectAll(".legend")
            .data(mColor.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 250)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", mColor);

        legend.append("text")
            .attr("x", width - 256)
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