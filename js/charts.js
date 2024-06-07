function init() {
    const container = d3.select("#chart1");
    const containerWidth = container.node().getBoundingClientRect().width;
    const margin = { top: 50, right: 150, bottom: 100, left: 150 },
          width = containerWidth - margin.left - margin.right,
          height = 500;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let selectedVariable = 'FOODTFAT'; // Default variable
    const units = {
        'FOODTFAT': 'Grams per capita per day',
        'ACOLALCT': 'Liters per capita',
        'TOBATBCT': 'Cigarettes per capita',
        'FOODFRUI': 'Kilograms per capita',
        'FOODVEGG': 'Kilograms per capita',
        'BODYOBMS': 'Percentage of population'
    };

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    function updateChart() {
        d3.csv("./data/dataset1.csv").then(function (data) {
            const selectedCountries = ["Australia", "China", "India", "Indonesia", "Israel", "Japan", "Korea", "New Zealand"];

            const filteredData = data.filter(d =>
                selectedCountries.includes(d.Country) &&
                d.VAR === selectedVariable && ((selectedVariable === 'FOODVEGE' && d.UNIT === "KGPPERNB") ||
                (selectedVariable === 'BODYOBMS' && d.UNIT === "TOTPOPTX") ||
                (selectedVariable === 'TOBATBCT' && d.UNIT === "GRPPERQT") ||
                (selectedVariable !== 'FOODVEGE' && selectedVariable !== 'TOBATBCT' && selectedVariable !== 'BODYOBMS')));

            if (filteredData.length === 0) {
                svg.selectAll("*").remove();
                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", height / 2)
                    .attr("text-anchor", "middle")
                    .style("font-size", "16px")
                    .text("No data available for the selected variable");
                return;
            }

            const parseTime = d3.timeParse("%Y");
            filteredData.forEach(d => {
                d.Year = parseTime(d.Year);
                d.Value = +d.Value;
            });

            const colorScale = d3.scaleOrdinal()
                .domain(selectedCountries)
                .range(d3.schemeCategory10);

            const xScale = d3.scaleTime()
                .domain(d3.extent(filteredData, d => d.Year))
                .range([0, width]);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => d.Value)])
                .range([height, 0]);

            const line = d3.line()
                .x(d => xScale(d.Year))
                .y(d => yScale(d.Value));

            svg.selectAll("*").remove();

            selectedCountries.forEach(country => {
                const countryData = filteredData.filter(d => d.Country === country);
                svg.append("path")
                    .datum(countryData)
                    .attr("fill", "none")
                    .attr("stroke", colorScale(country))
                    .attr("stroke-width", 2)
                    .attr("d", line);
            });

            svg.selectAll(".dot")
                .data(filteredData)
                .enter().append("circle")
                .attr("cx", d => xScale(d.Year))
                .attr("cy", d => yScale(d.Value))
                .attr("r", 3)
                .attr("fill", d => colorScale(d.Country))
                .on("mouseover", function(event, d) {
                    d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 6)  // Increase radius
                    .attr("stroke", "#000")  // Black stroke
                    .attr("stroke-width", 2);  // Width of the stroke
          
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Country: ${d.Country}<br>Year: ${d.Year.getFullYear()}<br>Value: ${d.Value} `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("r", 3)  // Return to normal radius
                    .attr("stroke", "none");  // Remove stroke
          
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            const xAxis = svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale));

            xAxis.append("text")
                .attr("x", width / 2)
                .attr("y", 40)
                .attr("fill", "#000")
                .style("text-anchor", "middle")
                .style("font-size", "18px")
                .text("Year");

            const yAxis = svg.append("g")
                .call(d3.axisLeft(yScale));

            yAxis.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("x", -height / 2)
                .attr("dy", "0.71em")
                .attr("fill", "#000")
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .text(units[selectedVariable]);

            const legend = svg.selectAll(".legend")
                .data(colorScale.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => `translate(0, ${i * 20})`);

            legend.append("rect")
                .attr("x", width + 20)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", colorScale);

            legend.append("text")
                .attr("x", width + 40)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .text(d => d);
        });
    }

    updateChart(); // Initial chart rendering

    // Button click event handlers
    document.querySelector(".btn-1").addEventListener("click", function () {
        selectedVariable = 'FOODTFAT';
        updateChart();
    });

    document.querySelector(".btn-2").addEventListener("click", function () {
        selectedVariable = 'ACOLALCT';
        updateChart();
    });

    document.querySelector(".btn-3").addEventListener("click", function () {
        selectedVariable = 'TOBATBCT';
        updateChart();
    });

    document.querySelector(".btn-4").addEventListener("click", function () {
        selectedVariable = 'FOODFRUI';
        updateChart();
    });

    document.querySelector(".btn-5").addEventListener("click", function () {
        selectedVariable = 'FOODVEGG';
        updateChart();
    });

    document.querySelector(".btn-6").addEventListener("click", function () {
        selectedVariable = 'BODYOBMS';
        updateChart();
    });
}


function initHeatmap() {
    const container = d3.select("#chart2"); // Assuming this is the container where the SVG will be appended
    const containerWidth = container.node().getBoundingClientRect().width; // Get the width of the container

    const margin = { top: 50, right: 50, bottom: 100, left: 150 },
        width = containerWidth - margin.left - margin.right,
        height = 500;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltip = d3.select("#tooltip");

    // Pre-set list of countries
    let selectedCountries = ["Australia", "China", "India", "Indonesia", "Israel", "Japan", "Korea", "New Zealand"];

    d3.csv("./data/dataset2.csv").then(function (data) {
        const causesOfDeath = [
            'Pneumonia', 'Malignant neoplasms', 'Diabetes mellitus',
            'Diseases of the circulatory system'
        ];

        function updateChart(year) {
            const filteredData = data.filter(d =>
                d.Year == year && selectedCountries.includes(d.Country) && causesOfDeath.includes(d.Variable));

            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(causesOfDeath)
                .padding(0.01);

            const yScale = d3.scaleBand()
                .range([height, 0])
                .domain(selectedCountries)
                .padding(0.01);

            svg.selectAll("*").remove();

            svg.selectAll()
                .data(filteredData, function (d) { return d.Country + ':' + d.Variable; })
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.Variable))
                .attr("y", d => yScale(d.Country))
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                .style("fill", d => {
                    const value = +d.Value;
                    if (value === 0 || d.Value === null) {
                        return "white";
                    } else if (value < 10) {
                        return "#C8EDFF";
                    } else if (value < 50) {
                        return "#A0E1FF";
                    } else if (value < 100) {
                        return "#95DCFF";
                    } else if (value < 500) {
                        return "#85D1F5";
                    } else if (value < 1000) {
                        return "#75CDF9";
                    } else if (value < 1500) {
                        return "#5BC3FF";
                    } else if (value < 2000) {
                        return "#15B1FF";
                    } else {
                        return "#0AA0FF";
                    }
                })
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    const valueText = (+d.Value === 0 || d.Value === null) ? "NA" : d.Value;
                    tooltip.html(`Country: ${d.Country}<br>Cause: ${d.Variable}<br>Value: ${valueText}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

                svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

            svg.append("g")
                .call(d3.axisLeft(yScale));

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 50)
                .attr("text-anchor", "middle")
                .style("font-size", "1em")
                .text("Cause of Dead");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", - 100)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "1em")
                .text("Country");

        }

        // Assume the most recent year or a default year is known
        updateChart(2012); // Update the chart for a specific year

        // Listen to change on select element
        document.getElementById("yearSelect2").addEventListener("change", function () {
            updateChart(this.value);
        });
    }).catch(function (error) {
        console.error('Error loading the CSV file:', error);
    });
}


function initStackedBarChart() {
    const container = d3.select("#chart3"); // Assuming this is the container where the SVG will be appended
    const containerWidth = container.node().getBoundingClientRect().width; // Get the width of the container

    const margin = { top: 50, right: 50, bottom: 100, left: 150 },
        width = containerWidth - margin.left - margin.right,
        height = 500;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltip = d3.select("#tooltip");

    // Set default selected countries
    let selectedCountries = ["Australia", "China", "India", "Indonesia", "Israel", "Japan", "Korea", "New Zealand"];
    let allYears = [];

    d3.csv("./data/dataset3.csv").then(function (data) {
        console.log("Data loaded:", data);

        const variables = ['ECONPIBN', 'ECONAICO', 'ECONFCEX'];
        const variableNames = {
            'ECONPIBN': 'GDP',
            'ECONAICO': 'Consumption',
            'ECONFCEX': 'Exports'
        };

        // Extract unique years for filtering
        allYears = Array.from(new Set(data.map(d => d.Year)));
        allYears.sort();

        // Populate year select dropdown
        const yearSelect = document.getElementById('yearSelect3');
        yearSelect.innerHTML = ""; // Clear previous options if any
        allYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        function updateChart(year) {
            const filteredData = data.filter(d =>
                d.Year == year &&
                selectedCountries.includes(d.Country) &&
                variables.includes(d.VAR) &&
                d.UNIT === "INDICEIP"
            );

            if (filteredData.length === 0) {
                console.log("No data available for the selected year and countries.");
                return;
            }

            const groupedData = d3.group(filteredData, d => d.Country);
            const stackedData = Array.from(groupedData, ([key, values]) => {
                const entry = { Country: key };
                variables.forEach(variable => {
                    entry[variable] = 0;  // Initialize to zero
                });
                values.forEach(v => {
                    entry[v.VAR] = +v.Value || 0;
                });
                return entry;
            });

            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(stackedData.map(d => d.Country))
                .padding(0.2);

            const yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, d3.max(stackedData, d => d.ECONPIBN + d.ECONAICO + d.ECONFCEX)]);

            const colorScale = d3.scaleOrdinal()
                .domain(variables)
                .range(['#CA2E55', '#FFE0B5', '#45A5E6']);

            svg.selectAll("*").remove();

            svg.selectAll("g")
                .data(d3.stack().keys(variables)(stackedData))
                .enter()
                .append("g")
                .attr("fill", d => colorScale(d.key))
                .selectAll("rect")
                .data(d => d)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.data.Country))
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                .attr("width", xScale.bandwidth())
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Country: ${d.data.Country}<br>${variableNames[d3.select(this.parentNode).datum().key]}: ${d[1] - d[0]}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

            svg.append("g")
                .call(d3.axisLeft(yScale));

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 50)
                .attr("text-anchor", "middle")
                .style("font-size", "1em")
                .text("Country");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -70)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "1em")
                .text("Price index : (2015=100)");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "1.5em")
                .text("Stacked Bar Chart of Economic Indicators by Country");

            // Add legend
            const legend = svg.selectAll(".legend")
                .data(variables)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => `translate(0,${i * 20})`);

            legend.append("rect")
                .attr("x", width - 40)
                .attr("y", height + 30)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", colorScale);

            legend.append("text")
                .attr("x", width - 50)
                .attr("y", height + 39)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .style("font-size", "1em")
                .text(d => variableNames[d]);
        }

        // Initial update
        updateChart(allYears[0]);  // Default year or most recent year

        // Listen to change on select element
        document.getElementById("yearSelect3").addEventListener("change", function () {
            updateChart(this.value);
        });
    }).catch(function (error) {
        console.error('Error loading the CSV file:', error);
    });
}
window.onload = function () {
    initHeatmap();
    init();
    initStackedBarChart();
};
