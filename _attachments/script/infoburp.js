
var width = 960,
    height = 500,
    fill = d3.scale.category20();


var previous_graph_state=restore_graph_state();// persistence/basic_persistence.js
    nodes = previous_graph_state.nodes;
    links = restore_links(previous_graph_state);

var vis = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all")
	.append('svg:g')
    .call(d3.behavior.zoom().on("zoom",  redraw))
	.append('svg:g');

vis.append("rect")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .distance(30)
    .nodes(nodes)
    .links(links)
    .size([width, height]);

var cursor = vis.append("circle")
    .attr("r", 0)
    .attr("transform", "translate(-100,-100)")
    .attr("class", "cursor");


force.on("tick", function() {
  vis.selectAll("line.link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  vis.selectAll("circle.node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});

vis.on("mousemove", function() {
  cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
});

vis.on("mousedown", function() {
  var point = d3.mouse(this),
      node = {x: point[0], y: point[1]},
      n = nodes.push(node);

  // add links to any nearby nodes
  nodes.forEach(function(target) {
    var x = target.x - node.x,
        y = target.y - node.y;
    if ((Math.sqrt(x * x + y * y) < 30) && ((x!=0) && (y!=0))) {
      links.push({source: node, target: target});
    }
  });

  restart();
});

restart();

function restart() {
  force.start();

  vis.selectAll("line.link")
      .data(links)
    .enter().insert("line", "circle.node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  vis.selectAll("circle.node")
      .data(nodes)
    .enter().insert("circle", "circle.cursor")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 4.5)
      .call(force.drag);
}

function redraw() {
	
  console.log("here", d3.event.translate, d3.event.scale);
  vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}

