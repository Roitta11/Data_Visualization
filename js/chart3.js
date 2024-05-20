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

window.onload = initStackedBarChart;
