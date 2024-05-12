function init() {
    var w = 700;
    var h = 500;
    var padding = 30; // Added padding for axes

    var svg = d3.select("#chart1")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Parse the CSV data
    d3.csv("../health.csv").then(function (data) {
        const australiaData = data.filter(d => d.Country === "Australia" && d.VAR === "BODYVBMS");
        // Prepare the data for the line chart
        const parsedData = australiaData.map(d => ({
            year: +d.Year,
            measure: d.Measure,
            value: +d.Value
        }));

        // Create scales
        const xScale = d3.scaleBand()
            .domain(parsedData.map(d => d.year))
            .range([padding, w - padding])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(parsedData, d => d.value)])
            .range([h - padding, padding]); // Reverse to start bars from bottom

        // Create bars
        svg.selectAll("rect")
            .data(parsedData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => h - padding - yScale(d.value))
            .attr("fill", "steelblue");

        // Add x-axis
        svg.append("g")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(d3.axisBottom(xScale));

        // Add y-axis
        svg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .call(d3.axisLeft(yScale));

    });
}

window.onload = init;
