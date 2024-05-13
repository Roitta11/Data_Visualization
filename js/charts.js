function init() {
    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("../health.csv").then(function (data) {
        const selectedCountries = ['Australia', 'Canada', 'Korea', 'Brazil', 'Russia'];
        const variable = 'FOODTFAT'; // Variable for the line chart

        // Filter data for selected countries and variable
        const filteredData = data.filter(d => selectedCountries.includes(d.Country) && d.VAR === variable);

        // Parse year as date
        const parseTime = d3.timeParse("%Y");
        filteredData.forEach(function (d) {
            d.Year = parseTime(d.Year);
            d.Value = +d.Value;
        });

        // Define color scale
        const colorScale = d3.scaleOrdinal()
            .domain(selectedCountries)
            .range(d3.schemeCategory10); // Or any other color scheme you prefer

        // Create scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(filteredData, d => d.Year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.Value)])
            .range([height, 0]);

        // Define line generator
        const line = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d.Value));

        // Draw lines
        selectedCountries.forEach(country => {
            const countryData = filteredData.filter(d => d.Country === country);
            svg.append("path")
                .datum(countryData)
                .attr("fill", "none")
                .attr("stroke", colorScale(country))
                .attr("stroke-width", 2)
                .attr("d", line);
        });

        // Add x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        // Add y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add chart title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Total Fat Supply (FOODTFAT) in Selected Countries");
    });
}

window.onload = init;
