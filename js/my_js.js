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

// Append a svg for bar charts
var chart2 = d3.select("body")
    .append("div")
    .attr("class", "chart")
    .style("display", "inline-block")
    .append("svg")
    .attr("id", "chart2")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("class", "bar-charts")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Get the data, plot the charts
d3.csv("/data/2008_rates_by_month.csv", function(data) {
    data.forEach(function(d) {
        d["Departure Delay"] = +d["DepDelayed"];
        d["Arrival Delay"] = +d["ArrDelayed"];
        d["Cancellation"] = +d["Cancelled"];
    });

    bubbleChart(data);
    barCharts(data);
});

// Manually set all the axes with the same max and min values for consistency
var axisMax_delay_rate = 0.31,
    axisMin_delay_rate = 0.1,
    axisMax_cancel_rate = 0.08;

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
    xScale.domain([axisMin_delay_rate, axisMax_delay_rate]).nice();
    yScale.domain([axisMin_delay_rate, axisMax_delay_rate]).nice();
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
        .attr("x1", xScale(axisMin_delay_rate))
        .attr("y1", yScale(axisMin_delay_rate))
        .attr("x2", xScale(axisMax_delay_rate))
        .attr("y2", yScale(axisMax_delay_rate))
        .attr("stroke-dasharray", ("5, 5"));

    var bubbles = chart1.selectAll(".bubble")
        .data(data)
        .enter();

    bubbles.append("circle")
        .attr("class", function(d) { return "bubble month-" + d["Month"]; })
        .attr("r", function(d) { return rScale(d["Cancellation"]); })
        .attr("cx", function(d) { return xScale(d["Departure Delay"]); })
        .attr("cy", function(d) { return yScale(d["Arrival Delay"]); })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    bubbles.append("text")
        .attr("class", function(d) { return "bubble-label month-label-" + d["Month"]; })
        .attr("x", function(d){ return xScale(d["Departure Delay"]); })
        .attr("y", function(d){ return yScale(d["Arrival Delay"]) + 5; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d["Month"]; })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);
}

function barCharts(data) {
    /*
    Bar Chart 1
    x-axis: Percentage of Departure Delay
    y-axis: Month

    Bar Chart 2
    x-axis: Percentage of Arrival Delay
    y-axis: Month

    Bar Chart 3
    x-axis: Percentage of Cancellation
    y-axis: Month
    */

    // Create a bar plot for each data column
    n = 3;
    for (var i = 0; i < n; i ++) {
        barChart(data, i);
    }

}

// Sort the data so each bar chart is sorted in increasing order of monthly rates
function sortMonths(data, varName) {
    dataSorted = data.sort(function(a, b) { return a[varName] - b[varName]; });
    return dataSorted;
}

function barChart(data, idx) {

    // Get the data column name
    var column_names = ["Departure Delay", "Arrival Delay", "Cancellation"]
    var varName = column_names[idx];

    // Sort the data by the column varName
    var dataSorted = sortMonths(data, varName)

    // Define the scales
    var xScale = d3.scaleBand()
        .range([0, width])
        .paddingInner(0.1)
        .paddingOuter(0.6);

    var yAxisHeight = height / n - 20;
    var yScale = d3.scaleLinear()
        .range([yAxisHeight, 0])

    // Define the axes
    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(12);

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickFormat(function(d) { return Math.floor(parseFloat(d) * 100); })
        .ticks(4);

    // Set the domains
    xScale.domain(dataSorted.map(function(d) { return d["Month"]; }));
    if (varName == "Departure Delay" || varName == "Arrival Delay") {
        yScale.domain([0, axisMax_delay_rate]);
    } else if (varName == "Cancellation") {
        yScale.domain([0, axisMax_cancel_rate]);
    }

    // Append a g for bar chart
    var barChart = chart2.append("g")
        .attr("class", "bar-chart")
        .attr("transform", "translate(0," + (idx * height / n + 20) + ")");

    // Add the axes
    barChart.append("g")
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
        .text(varName)
        .append("tspan")
        .style("font-weight", "normal")
        .text(" (%)");

    var bars = barChart.selectAll(".bar")
        .data(dataSorted)
        .enter();

    bars.append("rect")
        .attr("class", function(d) { return "bar month-" + d["Month"]; })
        .attr("x", function(d) { return xScale(d["Month"]); })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { return yScale(d[varName]); })
        .attr("height", function(d) { return (yAxisHeight - yScale(d[varName])); })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    bars.append("text")
        .attr("class", function(d) { return "bar-label month-label-" + d["Month"]; })
        .attr("x", function(d) { return xScale(d["Month"]) + xScale.bandwidth() / 2; })
        .attr("y", function(d) { return yScale(d[varName]); })
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d["Month"]; });
}

// Add tooltip
var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("display", "none");

// Tooltip number formats
var formatTooltipPercent = d3.format(".1%");

function mouseover() {
    div.style("display", "inline-block");
    var month = d3.select(this).datum()["Month"];
    d3.selectAll(".month-" + month)
        .style("opacity", 0.9);
    d3.select(".bubble.month-" + month)
        .transition()
        .style("stroke", "#333")
        .style("stroke-width", 2)
        .duration(500);
    d3.selectAll(".month-label-" + month)
        .style("fill", "#333");

    // Solve month 9 and 10 overlap problem
    if (month == 9) {
        d3.select(".month-label-10")
            .style("opacity", "0");
    }
}

function mousemove(d) {
    div.style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY - 10 + "px")
        .html("Month: <b>" + d["Month"] + "</b><br />" +
            "Percentage of<br />" +
            "Departure Delay: <b>" + formatTooltipPercent(d["Departure Delay"]) + "</b><br />" +
            "Arrival Delay: <b>" + formatTooltipPercent(d["Arrival Delay"]) + "</b><br />" +
            "Cancellation: <b>" + formatTooltipPercent(d["Cancellation"]) + "</b>");
}

function mouseout() {
    div.style("display", "none");
    var month = d3.select(this).datum()["Month"];
    d3.selectAll(".month-" + month)
        .style("opacity", 0.6);
    d3.select(".bubble.month-" + month)
        .transition()
        .style("stroke", "none")
        .duration(500);
    d3.selectAll(".month-label-" + month)
        .style("fill", "#fff");

    // Solve month 9 and 10 overlap problem
    d3.select(".month-label-10")
            .style("opacity", "1");
}
