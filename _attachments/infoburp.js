var width = 1024,
    height = 500;
    trans=[0,0]
    scale=1;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height])
   ;

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all")
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", redraw))
    .append('svg:g');

svg.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'black');

function redraw() {
  console.log("here", d3.event.translate, d3.event.scale);
  vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}


d3.json("infoburp.json", function(json) {
  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

  var link = svg.selectAll("line.link")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link")
      .attr("id", function(d) { return d.id; })
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });
      
  var color = "#FFFFFF";
  var node = svg.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("id", function(d) { return d.id; })
      .attr("r", 5)
      .style("fill", function(d) { return color; })
      .call(force.drag);

  node.append("title")
   .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});
