var width = 960,
    height = 500,
    fill = d3.scale.category20(),
    nodes = [],
    links = [];

var vis = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

vis.append("rect")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .distance(30)
    .nodes(nodes)
    .links(links)
    .size([width, height]);

var cursor = vis.append("circle")
    .attr("r", 30)
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
    if (Math.sqrt(x * x + y * y) < 30) {
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



/*
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


// In this initial version of script we just taking some static json file and displaying it as force layout

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
*/