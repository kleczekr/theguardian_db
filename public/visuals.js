const parser = d3.utcParse("%Y-%m-%d");
const formatTime = d3.timeFormat("%Y-%m-%d");
const currentDate = new Date();
let dateFrom = parser("2018-01-01");
let dateTo = currentDate;
let today = currentDate.toISOString().slice(0, 10);
const container = "#vizcontainer";
const listcontainer = "#listcontainer";
const bisectDate = d3.bisector((d) => d.date).left;
const margin = { top: 60, right: 30, bottom: 50, left: 50 },
  width = 1060 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
const keysOrig = [
  "Justin Trudeau",
  "Theresa May",
  "Boris Johnson",
  "Emmanuel Macron",
  "Angela Merkel",
  "Jacinda Ardern",
  "Bernie Sanders",
];
let keys = keysOrig;

d3.select("#fromDate").on("input", function () {
  datepickFrom(this);
});

d3.select("#toDate").on("input", function () {
  datepickTo(this);
});

function datepickFrom(input) {
  // let datFrom = d3.select("#fromDate").property('value')
  let datFrom = input.value;
  let datFromParsed = parser(datFrom);
  dateFrom = datFromParsed;
  d3.select(container).html(null);
  load_data();
}

function datepickTo(input) {
  // let datTo = d3.select("#toDate").property('value')
  let datTo = input.value;
  let datToParsed = parser(datTo);
  dateTo = datToParsed;
  d3.select(container).html(null);
  load_data();
}

d3.selectAll(".myCheckbox").on("change", function () {
  let choices = [];
  d3.selectAll(".myCheckbox").each(function (d) {
    cb = d3.select(this);
    if (cb.property("checked")) {
      choices.push(cb.property("value"));
    }
  });
  keys = choices;
  d3.select(container).html(null);
  load_data();
});

function draw_chart(data, detail) {
  // append the svg object to the body of the page
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const color = d3.scaleOrdinal().domain(keys).range(d3.schemeSet2);

  //////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////STACK THE DATA////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  const stackedData = d3.stack().keys(keys)(data);

  console.log(stackedData);
  //////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////AXIS DEFINITIONS//////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  const maxY = d3.max(stackedData[stackedData.length - 1], (d) => d[1]);

  let x = d3
    .scaleUtc()
    .domain([dateFrom, dateTo])
    // .domain(d3.extent(data.map(d => d.date)))
    .range([0, width]);

  let xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(width / 80)
        .tickSizeOuter(0)
    );

  let y = d3
    .scaleLinear()
    .domain([0, maxY + 20])
    .rangeRound([height, 0]);

  let yAxis = svg
    .append("g")
    .attr("transform", `translate(0,0)`)
    .style("color", "steelblue")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(data.y)
    );

  //////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////PRETTY COLORS/////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  // Add a clipPath: everything out of this area won't be drawn.
  const clip = svg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  const areaChart = svg.append("g").attr("clip-path", "url(#clip)");

  // Area generator
  const area = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  // Show the areas
  areaChart
    .selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .attr("class", (d) => "myArea " + d.key)
    .style("fill", (d) => color(d.key))
    .attr("d", area);

  // FROM HERE TILL UPDATECHART THERE IS A DEFINITION
  // OF A TOOLTIP

  // see if areaChart works with zoom, otherwise set it to svg
  let focus = areaChart.append("g").style("display", "none");

  // append the x line
  focus
    .append("line")
    .attr("class", "x")
    .style("stroke", "blue")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("y1", 0)
    .attr("y2", height);

  // append the y line
  focus
    .append("line")
    .attr("class", "y")
    .style("stroke", "blue")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("x1", width)
    .attr("x2", width);

  // append a circle at the intersection
  focus
    .append("circle")
    .attr("class", "y")
    .style("fill", "none")
    .style("stroke", "blue")
    .attr("r", 4);

  // append value at the intersection
  focus
    .append("text")
    .attr("class", "y1")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.9)
    .attr("dx", 8)
    .attr("dy", "-6.3em");
  focus
    .append("text")
    .attr("class", "y2")
    // .style('stroke', '#d66f49')
    .attr("dx", 8)
    .attr("dy", "-6.3em");

  // append value at the intersection
  focus
    .append("text")
    .attr("class", "y12")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.9)
    .attr("dx", 8)
    .attr("dy", "-5.3em");
  focus
    .append("text")
    .attr("class", "y22")
    // .style('stroke', '#4ca88b')
    .attr("dx", 8)
    .attr("dy", "-5.3em");

  // append value (if present) at the intersection
  focus
    .append("text")
    .attr("class", "y13")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.9)
    .attr("dx", 8)
    .attr("dy", "-4.3em");
  focus
    .append("text")
    .attr("class", "y23")
    // .style('stroke', "#91352c")
    .attr("dx", 8)
    .attr("dy", "-4.3em");

  // append the value (if present) at the intersection
  focus
    .append("text")
    .attr("class", "y14")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.9)
    .attr("dx", 8)
    .attr("dy", "-3.3em");
  focus
    .append("text")
    .attr("class", "y24")
    // .style('stroke', "#91352c")
    .attr("dx", 8)
    .attr("dy", "-3.3em");

  // append the value (if present) at the intersection
  focus
    .append("text")
    .attr("class", "y15")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.9)
    .attr("dx", 8)
    .attr("dy", "-2.3em");
  focus
    .append("text")
    .attr("class", "y25")
    // .style('stroke', "#91352c")
    .attr("dx", 8)
    .attr("dy", "-2.3em");

  // append the value (if present) at the intersection
  focus
    .append("text")
    .attr("class", "y16")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.9)
    .attr("dx", 8)
    .attr("dy", "-1.3em");
  focus
    .append("text")
    .attr("class", "y26")
    // .style('stroke', "#91352c")
    .attr("dx", 8)
    .attr("dy", "-1.3em");

  // append the value (if present) at the intersection
  focus
    .append("text")
    .attr("class", "y17")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.9)
    .attr("dx", 8)
    .attr("dy", "-.3em");
  focus
    .append("text")
    .attr("class", "y27")
    // .style('stroke', "#91352c")
    .attr("dx", 8)
    .attr("dy", "-.3em");

  // place date at the intersection
  focus
    .append("text")
    .attr("class", "y3")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.8)
    .attr("dx", 8)
    .attr("dy", "1em");
  focus.append("text").attr("class", "y4").attr("dx", 8).attr("dy", "1em");

  // a rectangle to capture mouse movements
  // testing with areaChart---you might need to change
  // it to svg later
  areaChart
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => {
      focus.style("display", null);
    })
    .on("mouseout", () => {
      focus.style("display", "none");
    })
    .on("mousemove", mousemove)
    .on("click", clickFunction);

  /// catch the objects with info according to the date
  function clickFunction() {
    let x0 = formatTime(x.invert(d3.pointer(event, this)[0]));
    console.log(x0);
    let detailFilter = detail
      .filter((d) => d.webPublicationDate === x0)
      .filter((d) => keys.includes(d.name));
    console.log(detailFilter);
    d3.select(listcontainer).html(null);
    for (let i = 0; i < detailFilter.length; i++) {
      d3.select(listcontainer)
        .append("p")
        .html(
          `<b>${detailFilter[i]["name"]}</b>: <a href="${detailFilter[i]["webUrl"]}" target="_blank">${detailFilter[i]["webTitle"]}</a>; ${detailFilter[i]["sectionName"]}`
        );
      // console.log(`<a href="${detailFilter[i]['webUrl']}">${detailFilter[i]['webTitle']}</a>`);
    }
  }

  function mousemove() {
    let x0 = x.invert(d3.pointer(event, this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    let sumHeight = 0;
    for (let i = 0; i < keys.length; i++) {
      sumHeight += d[keys[i]];
    }
    let yHeight = y(sumHeight);

    let dynamic_x = x(d.date) < width - 120 ? x(d.date) : x(d.date) - 120;

    focus
      .select("circle.y")
      .attr("transform", "translate(" + x(d.date) + "," + yHeight + ")");

    focus
      .select("text.y1")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(`Angela Merkel: ${d["Angela Merkel"]}`);

    focus
      .select("text.y2")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .style("stroke", color("Angela Merkel"))
      .html(`Angela Merkel: ${d["Angela Merkel"]}`);

    focus
      .select("text.y12")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(`Bernie Sanders: ${d["Bernie Sanders"]}`);

    focus
      .select("text.y22")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .style("stroke", color("Bernie Sanders"))
      .text(`Bernie Sanders: ${d["Bernie Sanders"]}`);

    focus
      .select("text.y13")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(`Boris Johnson: ${d["Boris Johnson"]}`);

    focus
      .select("text.y23")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .style("stroke", color("Boris Johnson"))
      .text(`Boris Johnson: ${d["Boris Johnson"]}`);

    focus
      .select("text.y14")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(`Emmanuel Macron: ${d["Emmanuel Macron"]}`);

    focus
      .select("text.y24")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .style("stroke", color("Emmanuel Macron"))
      .text(`Emmanuel Macron: ${d["Emmanuel Macron"]}`);

    focus
      .select("text.y15")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(`Jacinda Ardern: ${d["Jacinda Ardern"]}`);

    focus
      .select("text.y25")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .style("stroke", color("Jacinda Ardern"))
      .text(`Jacinda Ardern: ${d["Jacinda Ardern"]}`);

    focus
      .select("text.y16")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(`Justin Trudeau: ${d["Justin Trudeau"]}`);

    focus
      .select("text.y26")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .style("stroke", color("Justin Trudeau"))
      .text(`Justin Trudeau: ${d["Justin Trudeau"]}`);

    focus
      .select("text.y17")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(`Theresa May: ${d["Theresa May"]}`);

    focus
      .select("text.y27")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .style("stroke", color("Theresa May"))
      .text(`Theresa May: ${d["Theresa May"]}`);

    focus
      .select("text.y3")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(d.date.toISOString().slice(0, 10));

    focus
      .select("text.y4")
      .attr("transform", "translate(" + dynamic_x + "," + yHeight + ")")
      .text(d.date.toISOString().slice(0, 10));

    focus
      .select(".x")
      .attr("transform", "translate(" + x(d.date) + "," + yHeight + ")")
      .attr("y2", height - yHeight);

    focus
      .select(".y")
      .attr("transform", "translate(" + width * -1 + "," + yHeight + ")")
      .attr("x2", width + width);
  }
}

/////////////////////////
/////// BACKEND HERE ////
/////////////////////////

// fetch the JSON with data
// using axios since I can't think of anything else
const dataSet = async function getData() {
  // return await axios.get('/order/json');
  return await axios.get("/guardian/json");
};
async function awaitData() {
  const data = dataSet();
  return data;
}

function load_data() {
  Promise.all([awaitData()]).then((values) => {
    data = values[0].data;
    console.log(data);
    data.map((d) => {
      d.webPublicationDate = d.webPublicationDate.slice(0, 10);
      d.date = parser(d.webPublicationDate);
    });

    const flatRoll = d3.flatRollup(
      data,
      (v) => v.length,
      (d) => d.date,
      (d) => d.name
    );

    const flatArrayObj = flatRoll.map(([date, name, count]) => ({
      date,
      name,
      count,
    }));

    let res = Array.from(
      d3.group(flatArrayObj, (d) => d.date),
      ([date, group]) =>
        Object.fromEntries(
          [["date", date]].concat(group.map((d) => [d.name, d.count]))
        )
    );

    function sortByDateAscending(a, b) {
      // Dates will be cast to numbers automagically:
      return a.date - b.date;
    }

    for (let i = 0; i < res.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        !Object.keys(res[i]).includes(keys[j])
          ? (res[i][keys[j]] = 0)
          : console.log(
              `No, the keys ${Object.keys(res[i])} already include ${keys[j]}`
            );
      }
    }

    res = res.sort(sortByDateAscending);

    console.log(res);

    draw_chart(res, data);
  });
}

load_data();
