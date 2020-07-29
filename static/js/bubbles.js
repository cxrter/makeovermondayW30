// set the dimensions and margins of the graph
var margin = {top: 100, right: 30, bottom: 150, left: 50},
    height = 800 - margin.top - margin.bottom
    width = 1400 - margin.left - margin.right
    radius = 5
    padding = 1     // space between nodes
    cluster_padding = 5;    // Space between nodes in different stages

function responsivefy(svg) {
      // get container + svg aspect ratio
      var container = d3.select(svg.node().parentNode),
          width = parseInt(svg.style("width")),
          height = parseInt(svg.style("height")),
          aspect = width / height;

      // add viewBox and preserveAspectRatio properties,
      // and call resize so that svg resizes on inital page load
      svg.attr("viewBox", "0 0 " + width + " " + height)
          .attr("preserveAspectRatio", "xMinYMid")
          .call(resize);

      // to register multiple listeners for same event type,
      // you need to add namespace, i.e., 'click.foo'
      // necessary if you call invoke this function for multiple svgs
      // api docs: https://github.com/mbostock/d3/wiki/Selections#on
      d3.select(window).on("resize." + container.attr("id"), resize);

      // get width of container and resize svg to fit it
      function resize() {
          var targetWidth = parseInt(container.style("width"));
          svg.attr("width", targetWidth);
          svg.attr("height", Math.round(targetWidth / aspect));
      }
    }

// append the svg object to the body of the page
var svg = d3.select("#my_viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(responsivefy)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

  // Add Title
  var title = svg.append('text')
    .attr("transform",  "translate(50,-80)")
    .attr('text-anchor', 'start')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'white')
    .style('font-size', '3em')
    .text('Women in Power');

    // Add Subtitle
  var subtitle = svg.append('text')
    .attr("transform",  "translate(50,-40)")
    .attr('text-anchor', 'start')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'lightgrey')
    .style('font-size', '1em')
    .text('The proportion of seats held by women in national parliaments is changing');


    // Add Signature
  var sig = svg.append('text')
    .attr("transform",  "translate("+width+","+(height+140)+")")
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'lightgrey')
    .style('font-size', '1em')
    .text('Viz by @annacxrter | July 2020');


var time = 0;
var interval;
var selected;


//Read the data
d3.csv("w30-data.csv", function(data) {


var filtered_data = data.filter(function(d){
        return d['Region'] != -99;
})

var allRegions = (d3.map(filtered_data, function(d){return(d['Region'])}).keys()).sort()
var allCountries = (d3.map(filtered_data, function(d){return(d['Country Name'])}).keys()).sort()

d3.select("#selectButton")
   .selectAll('myOptions')
 	.data(allCountries)
     .enter()
     	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

var x = d3.scaleBand()
  .domain(allRegions)
  .range([0, width])
var xAxis = svg.append("g")
    .attr('transform', 'translate(0,'+ height +')')
    .attr('class', 'axis')
    .call(d3.axisBottom(x).tickPadding(20))
    .selectAll(".tick text")
    .call(wrap, x.bandwidth()*2/3)
    .select(".domain").remove()

var y = d3.scaleLinear()
    .domain([0, 65])
    .range([height, 0])
  var yAxis = svg.append("g")
    .attr('class', 'axis yaxis')
    .attr('transform', 'translate(0,0)')
    .call(d3.axisLeft(y).tickFormat(d => d + "%"))
    svg.selectAll(".domain").remove()

var timeLabel = svg.append("text")
    .attr("y", -80)
    .attr("x", width - 40)
    .attr("font-size", "3em")
    .attr("opacity", "0.8")
    .attr("text-anchor", "end")
    .attr('alignment-baseline', 'middle')
    .style('fill', '#f5f5f5')
    .text("1997");

  // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
  // Its opacity is set to 0: we don't see it by default.
  var tooltip = d3.select("#my_viz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "#f5f5f5")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")


  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  var mouseover = function(d) {
      d3.selectAll("circle")

    tooltip
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    var mouse = d3.mouse(d3.select('#my_viz').node()).map(function(d) {return parseInt(d); });
    tooltip
        .style("top", mouse[1] + "px")
        .style("left", (mouse[0] + 30) + "px")
      .html(d['Country Name'])

  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0)
      .style('pointer-events', 'none')

  }

$("#play-button")
    .on("click", function(){
        var button = $(this);
        if (button.text() == "Play"){
            button.text("Pause");
            interval = setInterval(step, 800);
        }
        else {
            button.text("Play");
            clearInterval(interval);
        }
    })

$("#reset-button")
    .on("click", function(){
        time = 0;
        update(filtered_data);
    })

function step(){
    // At the end of our data, loop back
    time = (time < 22) ? time+1 : 0
    update(filtered_data);
}

lines = []
for (i in allRegions){
    lines[i] = svg
        .append('path')
        .attr('d', d3.line()([[0,0], [0,0]]))
        .attr('stroke', 'white')
        .attr('fill', 'none');
        }

function update(data) {
    // Standard transition time for the visualization
    var t = d3.transition()
        .duration(100);

    // JOIN new data with old elements.
    var circles = svg.selectAll("circle").data(filtered_data)

    circles
      .attr("class", function(d){return "dot " + d['Country Name'].replace(/[^a-zA-Z]/g, "")})
            .attr("cy", function(d){ return y(d[time+1997]); })
            .attr("cx", function(d){ return x(d['Region']) + (x.bandwidth()/2) })
            .attr("r", 10)
      .style('opacity', function(d){if (d['Country Name'] == selected){return 1;} else{return 0.5}})
      .style('stroke-width', function(d){if (d['Country Name'] == selected){return 1;} else{return 0}})
      .style('stroke', 'white')
      .attr("fill", function(d){if (String(d['Country Name']) == selected){return '#3581B8';} else{return '#E46A3A'}})

    // ENTER new elements present in new data.
    circles.enter()
        .append("circle")
        .attr("class", function(d){return "dot " + d['Country Name'].replace(/[^a-zA-Z]/g, "")})
        .attr("fill", function(d){if (String(d['Country Name']) == selected){return '#3581B8';} else{return '#E46A3A'}})
        .style('opacity', 0.5)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove )
        .on("mouseleave", mouseleave )
        .merge(circles)
        .transition(t)
        .duration(100)
            .attr("cy", function(d){ return y(d[time+1997]); })
            .attr("cx", function(d){ return x(d['Region']) + (x.bandwidth()/2) })
            .attr("r", 10);

        svg.selectAll("." + String(selected).replace(/[^a-zA-Z]/g, ""))
            .raise()

    // Update the time label
    timeLabel.text(+(time + 1997))

    // get each region avg
    for (i in allRegions){
    filtered = data.filter(function(d){
        return d['Region'] == allRegions[i];})
    region_avg = d3.mean(filtered.filter(d => d[time+1997] != -99), d => d[time+1997])

    lines[i].attr('d', d3.line()([[x(allRegions[i])+70,y(region_avg)], [x(allRegions[i])+(x.bandwidth()-70),y(region_avg)]]))
    }

}


function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        selected = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(filtered_data)
    })

update(filtered_data);
})















