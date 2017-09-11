// Set margin, width and height
var margin = {top: 30, right: 30, bottom: 30, left: 30}
    height = 600 - margin.top - margin.bottom
    width = 450 - margin.left -margin.right

// Append a svg for bubble chart
var chart1 = d3.select("body")
    .append("div")
    .attr("class", "chart")
    .style("display", "inline-block")
    .append("svg")
    .attr("id", "chart1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("class", "bubble-chart")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Get the data, plot the chart
d3.csv("/data/2008_rates_by_month.csv", function(data) {
    data.forEach(function(d) {
        d["Departure Delay"] = +d["DepDelayed"];
        d["Arrival Delay"] = +d["ArrDelayed"];
        d["Cancellation"] = +d["Cancelled"];
    });

    bubbleChart(data);
});

// Manually set all the axes with the same max and min values for consistency
var axisMax = 0.31,
    axisMin = 0.1;

function bubbleChart(data) {

    /*
    Bubble Chart

    x-axis: Percentage of Departure Delays
    y-axis: Percentage of Arrival Delays
    bubble area: Percentage of Cancellation
    */

    // Define the scales
    var xScale = d3.scaleLinear()
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .range([height, 0]);

    var rScale = d3.scaleSqrt()
        .range([0, 60]);

    // Define the axes
    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(function(d) { return Math.floor(parseFloat(d) * 100); })
        .ticks(5);

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickFormat(function(d) { return Math.floor(parseFloat(d) * 100); })
        .ticks(5);

    // Set the domains
    xScale.domain([axisMin, axisMax]).nice();
    yScale.domain([axisMin, axisMax]).nice();
    rScale.domain([0, d3.max(data, function(d) { return Math.sqrt(d["Cancellation"]); })]).nice();


    // Add axes
    chart1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .append("tspan")
        .style("font-weight", "bold")
        .text("Departure Delay")
        .append("tspan")
        .style("font-weight", "normal")
        .text(" (%)");

    chart1.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .append("tspan")
        .style("font-weight", "bold")
        .text("Arrival Delay")
        .append("tspan")
        .style("font-weight", "normal")
        .text(" (%)");

    // Add diagonal line
    chart1.append("line")
        .attr("class", "diagonal")
        .attr("x1", xScale(axisMin))
        .attr("y1", yScale(axisMin))
        .attr("x2", xScale(axisMax))
        .attr("y2", yScale(axisMax))
        .attr("stroke-dasharray", ("5, 5"));

    var bubbles = chart1.selectAll(".bubble")
        .data(data)
        .enter();

    bubbles.append("circle")
        .attr("class", function(d) { return "bubble month-" + d["Month"]; })
        .attr("r", function(d) { return rScale(d["Cancellation"]); })
        .attr("cx", function(d) { return xScale(d["Departure Delay"]); })
        .attr("cy", function(d) { return yScale(d["Arrival Delay"]); });

    bubbles.append("text")
        .attr("class", function(d) { return "bubble-label month-label-" + d["Month"]; })
        .attr("x", function(d){ return xScale(d["Departure Delay"]); })
        .attr("y", function(d){ return yScale(d["Arrival Delay"]) + 5; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d["Month"]; });
}
