function initChart1() {
    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("../data/health.csv").then(function (data) {
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

function initHeatmap() {
    const margin = { top: 50, right: 50, bottom: 100, left: 150 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltip = d3.select("#tooltip");

    let selectedCountries = [];
    let allCountries = [];

    function updateSelectedCountryList() {
        const selectedCountryListDiv = document.getElementById('selectedCountryList');
        selectedCountryListDiv.innerHTML = '';
        selectedCountries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            countryItem.innerHTML = `${country} <button onclick="removeCountry('${country}')">X</button>`;
            selectedCountryListDiv.appendChild(countryItem);
        });
    }

    d3.csv("../data/dataset2.csv").then(function (data) {
        const causesOfDeath = [
            'Pneumonia', 'Malignant neoplasms', 'Diabetes mellitus',
            'Diseases of the circulatory system'
        ];

        // Extract unique country names
        allCountries = Array.from(new Set(data.map(d => d.Country)));
        allCountries.sort();

        // Populate country select dropdown
        const countrySelect = document.getElementById('countrySelect');
        allCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });

        function updateChart(year) {
            const filteredData = data.filter(d => d.Year == year && selectedCountries.includes(d.Country) && causesOfDeath.includes(d.Variable));

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
                .attr("y", height + margin.bottom - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Cause of Death");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Country");

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text("Heatmap of Deaths by Disease and Country");
        }

        function addSelectedCountries() {
            const countrySelect = document.getElementById('countrySelect');
            const selectedOptions = Array.from(countrySelect.selectedOptions);
            selectedOptions.forEach(option => {
                const country = option.value;
                if (!selectedCountries.includes(country)) {
                    selectedCountries.push(country);
                }
            });
            updateSelectedCountryList();
            updateChart(document.getElementById("yearSelect").value);
        }

        window.removeCountry = function (country) {
            selectedCountries = selectedCountries.filter(c => c !== country);
            updateSelectedCountryList();
            updateChart(document.getElementById("yearSelect").value);
        };

        document.getElementById('addCountryButton').addEventListener('click', addSelectedCountries);

        // Initial update
        updateSelectedCountryList();
        updateChart(2012);  // Default year or most recent year

        // Listen to change on select element
        document.getElementById("yearSelect").addEventListener("change", function () {
            updateChart(this.value);
        });
    }).catch(function (error) {
        console.error('Error loading the CSV file:', error);
    });
}
window.onload = initHeatmap, initChart1;
