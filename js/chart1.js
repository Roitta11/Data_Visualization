// function init() {

// // set the dimensions and margins of the graph
// var margin = {top: 10, right: 30, bottom: 20, left: 50},
//     width = 460 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;

// // append the svg object to the body of the page
// var svg = d3.select("#chart1")
//   .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");

// // Parse the Data
// d3.csv("../health.csv", function(data) {

//   // List of subgroups = header of the csv files = soil condition here
//   var subgroups = data.columns.slice(1)

//   // List of groups = species here = value of the first column called group -> I show them on the X axis
//   var groups = d3.map(data, function(d){return(d.VAR)}).key()

//   // Add X axis
//   var x = d3.scaleBand()
//       .domain(groups)
//       .range([0, width])
//       .padding([0.2])
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x).tickSizeOuter(0));

//   // Add Y axis
//   var y = d3.scaleLinear()
//     .domain([0, 60])
//     .range([ height, 0 ]);
//   svg.append("g")
//     .call(d3.axisLeft(y));

//   // color palette = one color per subgroup
//   var color = d3.scaleOrdinal()
//     .domain(subgroups)
//     .range(['#e41a1c','#377eb8','#4daf4a'])

//   //stack the data? --> stack per subgroup
//   var stackedData = d3.stack()
//     .keys(subgroups)
//     (data)

//   // Show the bars
//   svg.append("g")
//     .selectAll("g")
//     // Enter in the stack data = loop key per key = group per group
//     .data(stackedData)
//     .enter().append("g")
//       .attr("fill", function(d) { return color(d.key); })
//       .selectAll("rect")
//       // enter a second time = loop subgroup per subgroup to add all rectangles
//       .data(function(d) { return d; })
//       .enter().append("rect")
//         .attr("x", function(d) { return x(d.data.group); })
//         .attr("y", function(d) { return y(d[1]); })
//         .attr("height", function(d) { return y(d[0]) - y(d[1]); })
//         .attr("width",x.bandwidth())
// })
    
// }

// window.onload = init;


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
      d3.csv("test_file_copy.csv").then(function (data) {
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
  
  window.onload = init;
  
