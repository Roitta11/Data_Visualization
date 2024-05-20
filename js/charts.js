function init() {
    const margin = { top: 50, right: 50, bottom: 100, left: 70 },
         width = 1200 - margin.left - margin.right,
         height = 600 - margin.top - margin.bottom;
  
    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    let selectedVariable = 'FOODTFAT'; // Default variable
  
    function updateChart() {
      d3.csv("../data/test_file_copy.csv").then(function (data) {
        const selectedCountries = ["Australia", "Austria", "Belgium", "Canada", "Czechia", "Denmark", "Finland", "France",
        "Germany", "Greece", "Hungary", "Iceland",
        "Argentina", "Croatia", "Bulgaria", "Peru"];
  
        // Filter data based on selected variable
        const filteredData = data.filter(d => selectedCountries.includes(d.Country) && d.VAR === selectedVariable);
        console.log('Selected Variable:', selectedVariable);
        console.log('Filtered Data:', filteredData);  // Log the filtered data
  
        if (filteredData.length === 0) {
          console.warn('No data found for the selected variable:', selectedVariable);
          svg.selectAll("*").remove();
          svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("No data available for the selected variable");
          return;
        }
  
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
  
        // Remove previous elements
        svg.selectAll("*").remove();
  
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
  
        // Add dots for each data point
        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yScale(d.Value))
            .attr("r", 3)
            .attr("fill", d => colorScale(d.Country));
  
        // Add x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("x", width / 2)
            .attr("y", 40)
            .attr("fill", "#000")
            .style("text-anchor", "middle")
            .style("font-size", "18px") // Increase font size
            .text("Year");
  
        // Add y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -height / 2)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .style("text-anchor", "middle")
            .style("font-size", "14px") // Increase font size
            .text("Grams per capita per day");
  
        // Add chart title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Total Fat Supply (" + (selectedVariable === 'FOODTFAT' ? 'FOODTFAT' : selectedVariable) + ") in Selected Countries");
      });
    }
  
    updateChart(); // Initial chart rendering
  
    // Button click event handlers
    document.querySelector(".btn-1").addEventListener("click", function() {
      selectedVariable = 'FOODTFAT';
      updateChart();
    });
  
    document.querySelector(".btn-2").addEventListener("click", function() {
      selectedVariable = 'ACOLALCT';
      updateChart();
    });
  
    document.querySelector(".btn-3").addEventListener("click", function() {
      selectedVariable = 'TOBATBCT';
      updateChart();
    });
  
    document.querySelector(".btn-4").addEventListener("click", function() {
      selectedVariable = 'FOODFRUI';
      updateChart();
    });
  }
  
function initHeatmap() {
    const margin = { top: 50, right: 50, bottom: 100, left: 150 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart2")
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
            countryItem.innerHTML = `${country} <button onclick="removeCountry('${country}')">Remove</button>`;
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
            updateChart(document.getElementById("yearSelect2").value);
        }

        window.removeCountry = function (country) {
            selectedCountries = selectedCountries.filter(c => c !== country);
            updateSelectedCountryList();
            updateChart(document.getElementById("yearSelect2").value);
        };

        document.getElementById('addCountryButton').addEventListener('click', addSelectedCountries);

        // Initial update
        updateSelectedCountryList();
        updateChart(2012);  // Default year or most recent year

        // Listen to change on select element
        document.getElementById("yearSelect2").addEventListener("change", function () {
            updateChart(this.value);
        });
    }).catch(function (error) {
        console.error('Error loading the CSV file:', error);
    });
}

function initStackedBarChart() {
    console.log("Initializing stacked bar chart...");
  
    const margin = { top: 50, right: 50, bottom: 100, left: 150 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  
    const svg = d3.select("#chart3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    const tooltip = d3.select("#tooltip");
  
    let selectedCountries = [];
    let allCountries = [];
    let allYears = [];
  
    function updateSelectedCountryList() {
        const selectedCountryListDiv = document.getElementById('selectedCountryList3');
        selectedCountryListDiv.innerHTML = '';
        selectedCountries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            countryItem.innerHTML = `${country} <button onclick="removeCountry('${country}')">Remove</button>`;
            selectedCountryListDiv.appendChild(countryItem);
        });
    }
  
    d3.csv("../data/dataset3.csv").then(function (data) {
        console.log("Data loaded:", data);
  
        const variables = ['ECONPIBN', 'ECONAICO', 'ECONFCEX'];
        const variableNames = {
            'ECONPIBN': 'GDP',
            'ECONAICO': 'Consumption',
            'ECONFCEX': 'Exports'
        };
  
        // Extract unique country names and years
        allCountries = Array.from(new Set(data.map(d => d.Country)));
        allCountries.sort();
        allYears = Array.from(new Set(data.map(d => d.Year)));
        allYears.sort();
  
        // Populate country select dropdown
        const countrySelect = document.getElementById('countrySelect3');
        allCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
  
        // Populate year select dropdown
        const yearSelect = document.getElementById('yearSelect3');
        allYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
  
        function updateChart(year) {
            const filteredData = data.filter(d => d.Year == year && selectedCountries.includes(d.Country) && variables.includes(d.VAR) && d.UNIT ==="INDICEIP");
            console.log("Filtered data:", filteredData);
  
            if (filteredData.length === 0) {
                console.log("No data available for the selected year and countries.");
                return;
            }
  
            // Prepare data for stacked bar chart
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
            console.log("Stacked data:", stackedData);
  
            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(stackedData.map(d => d.Country))
                .padding(0.2);
  
            const yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, d3.max(stackedData, d => d.ECONPIBN + d.ECONAICO + d.ECONFCEX)]);
  
            const colorScale = d3.scaleOrdinal()
                .domain(variables)
                .range(d3.schemeCategory10);
  
            const stack = d3.stack()
                .keys(variables);
  
            svg.selectAll("*").remove();
  
            svg.selectAll("g")
                .data(stack(stackedData))
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
                .text("Country");
  
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Index");
  
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text("Stacked Bar Chart of Economic Indicators by Country");
        }
  
        function addSelectedCountries() {
            const countrySelect = document.getElementById('countrySelect3');
            const selectedOptions = Array.from(countrySelect.selectedOptions);
            selectedOptions.forEach(option => {
                const country = option.value;
                if (!selectedCountries.includes(country)) {
                    selectedCountries.push(country);
                }
            });
            updateSelectedCountryList();
            updateChart(document.getElementById("yearSelect3").value);
        }
  
        window.removeCountry = function (country) {
            selectedCountries = selectedCountries.filter(c => c !== country);
            updateSelectedCountryList();
            updateChart(document.getElementById("yearSelect3").value);
        };
  
        document.getElementById('addCountryButton3').addEventListener('click', addSelectedCountries);
  
        // Initial update
        updateSelectedCountryList();
        updateChart(allYears[0]);  // Default year or most recent year
  
        // Listen to change on select element
        document.getElementById("yearSelect3").addEventListener("change", function () {
            updateChart(this.value);
        });
    }).catch(function (error) {
        console.error('Error loading the CSV file:', error);
    });
  }
  
window.onload = function() {
    initHeatmap();
    init();
    initStackedBarChart();
};
