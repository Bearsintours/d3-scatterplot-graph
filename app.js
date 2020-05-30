localStorage.getItem("cyclist-data")
  ? renderChart(JSON.parse(localStorage.getItem("cyclist-data")))
  : d3.json(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json",
      (data) => {
        localStorage.setItem("cyclist-data", JSON.stringify(data));
        renderChart(data);
      }
    );

function renderChart(data) {
  const dataset = data;
  const padding = 60;
  const width = dataset.length * 20 + 2 * padding;
  const height = 500;

  const YMin = d3.min(dataset, (d) => formatTime(d["Time"]) - 10);
  const YMax = d3.max(dataset, (d) => formatTime(d["Time"]));
  const YScale = d3
    .scaleLinear()
    .domain([YMin, YMax])
    .range([padding, height - padding]);

  const XMin = d3.min(dataset, (d) => Number(d["Year"]) - 1);
  const XMax = d3.max(dataset, (d) => Number(d["Year"]));
  const XScale = d3
    .scaleLinear()
    .domain([XMin, Number(XMax) + 1])
    .range([padding, width - padding]);

  const svg = d3
    .select("div")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "svg");

  const tootTip = d3.select("body").append("div").attr("id", "tooltip");

  svg
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => XScale(d["Year"]))
    .attr("cy", (d) => YScale(formatTime(d["Time"])))
    .attr("r", (d) => 5)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d["Year"])
    .attr("data-yvalue", (d) => formatTime(d["Time"]))
    .attr("fill", (d) => (d["Doping"].length > 0 ? "orange" : "#81A4CD"))
    .on("mouseover", (d) => {
      d3.select("#tooltip")
        .style("opacity", 0.8)
        .attr("data-year", d["Year"])
        .text(d["Year"] + ": " + d["Name"]);
    })
    .on("mouseout", () => d3.select("#tooltip").style("opacity", 0))
    .on("mousemove", () =>
      d3
        .select("#tooltip")
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY - 10 + "px")
    );

  const yAxis = d3
    .axisLeft(YScale)
    .tickFormat(
      (d) => new Date(d).getMinutes() + ":" + addZero(new Date(d).getSeconds())
    );

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis);

  const xAxis = d3.axisBottom(XScale).tickFormat(d3.format("d"));

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(xAxis);

  // Legend
  const legend = d3.select("svg").append("svg").attr("id", "legend");
  const legendMargin = 10;
  const legendData = [
    {
      text: "Doping allegations",
      color: "orange",
    },
    {
      text: "No doping allegations",
      color: "#81A4CD",
    },
  ];

  legend
    .selectAll("g.legend")
    .data(legendData)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return "translate(" + 600 + "," + (legendMargin + i * 20) + ")";
    })
    .each(function (d, i) {
      d3.select(this)
        .append("rect")
        .attr("width", 30)
        .attr("height", 15)
        .attr("fill", d.color);
      d3.select(this)
        .append("text")
        .attr("text-anchor", "start")
        .attr("x", 30 + 10)
        .attr("y", 15 / 2)
        .attr("dy", "0.35em")
        .text(d.text);
    });
}

function formatTime(time) {
  const date = new Date();
  time = time.split(":");
  const min = time[0];
  const sec = time[1];
  date.setMinutes(min, sec, 0);
  return date;
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}
