function init() {
    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("health.csv").then(function (data) {
    const selectedCountries = ['Australia', 'Canada', 'India', 'South Africa'];
    const year = 2019;
    const filteredData = data.filter(d => d.Year == year && selectedCountries.includes(d.Country));
    const variables = ['FOODSUCR', 'TOBATBCT', 'ACOLALCT', 'VAPEVAPY'];

    const stats = variables.reduce((acc, vari) => {
      const values = filteredData.filter(d => d.VAR === vari).map(d => +d.Value);
      const mean = d3.mean(values);
      const stdDev = d3.deviation(values);
      acc[vari] = { mean, stdDev };
      return acc;
    }, {});

    const mappedData = selectedCountries.map(country => {
      const output = { Country: country };
      variables.forEach(vari => {
        const item = filteredData.find(d => d.Country === country && d.VAR.trim() === vari);
        const zScore = item && stats[vari].stdDev > 0 ? (+item.Value - stats[vari].mean) / stats[vari].stdDev : 0;
        output[vari] = Math.max(0, Math.round(zScore + Math.abs(zScore))); // Ensure non-negative and round
      });
      return output;
    });

    const stack = d3.stack().keys(variables)(mappedData);
    const x = d3.scaleBand()
      .domain(selectedCountries)
      .range([0, width])
      .padding(0.1);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
      .domain([0, Math.max(...mappedData.map(d => Math.max(...variables.map(v => d[v]))))])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    const color = d3.scaleOrdinal()
      .domain(variables)
      .range(['red', 'blue', 'green', 'yellow']);

    svg.append("g")
      .selectAll("g")
      .data(stack)
      .enter().append("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", d => x(d.data.Country))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());
  });

}

window.onload = init;
