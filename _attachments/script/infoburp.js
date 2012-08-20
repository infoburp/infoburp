DISTANCE=30;

NEW_NODE_TEMPLATE={};

RADIUS_OF_LINKING=30; // Defines distance 

dragged_node_number=null;
dragged_link_number=null;


var width = 960, 
    height = 500, 
    fill = d3.scale.category20();

var previous_graph_state = restore_graph_state();
// persistence/basic_persistence.js

global_data={nodes:[], links:[]};


global_data.nodes = previous_graph_state.nodes;
global_data.links = restore_links(previous_graph_state);

var vis = d3.select("#chart").append("svg").attr("width", width).attr("height", height).attr("pointer-events", "all").append('svg:g').call(d3.behavior.zoom().on("zoom", redraw)).append('svg:g');

vis.append("rect").attr("width", width).attr("height", height);

var force = d3.layout.force()
    .distance(DISTANCE)
    .nodes(global_data.nodes)
    .links(global_data.links)
    .size([width, height]);

var cursor = vis.append("circle").attr("r", 0).attr("transform", "translate(-100,-100)").attr("class", "cursor");

function tick_fu() {
	vis.selectAll("line.link")
	    .attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	vis.selectAll("circle.node")
	    .attr("cx", function(d) { return d.x; })
	    .attr("cy", function(d) { return d.y; });
    };

force.on("tick",tick_fu);


//vis.on("mousemove", function() {
//	cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
//});


var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
        

function dragstart(d, i) {
        force.stop(); // stops the force auto positioning before you start dragging

	
	var new_node=NEW_NODE_TEMPLATE;

	dragged_node_number=global_data.nodes.push(new_node)-1;
	
	dragged_link_number=global_data.links.push({source:d,target:new_node})-1;
	
	restart();

    }

    function dragmove(d, i) {

	//Moving new node;
	
	if (global_data.nodes[dragged_node_number]){
            global_data.nodes[dragged_node_number].x = d3.event.x;
            global_data.nodes[dragged_node_number].y = d3.event.y;
	};

	tick_fu();
    }

function dragend(d, i) {
	var flag=true;
	global_data.nodes.forEach(function(target,num){
				      
				      var X=d3.event.sourceEvent.x -target.x;
				      var Y=d3.event.sourceEvent.y -target.y;
				      //console.log(d3.event.sourceEvent.x);
				      console.log("X,Y",X,Y);
				      
				     
				      if ((Math.sqrt(X*X+Y*Y)<RADIUS_OF_LINKING) && ( (X!==0) && (Y!==0) )&& flag && (num!==dragged_node_number) ){
					  
					  global_data.links[dragged_link_number].target=target;
					  
					  global_data.nodes.splice(dragged_node_number,dragged_node_number);
					  console.log(global_data);
					  flag=false;
					  restart();
				      };
				      
				  }


	);
	
	
	force.start();

    };




function restart() {

    vis.selectAll("line.link")
	.data(global_data.links)
	.enter().insert("line", "circle.node")
	.attr("class", "link")
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

    var loc_nodes=vis.selectAll("circle.node")
	.data(global_data.nodes);

    loc_nodes.enter().insert("circle", "circle.cursor")
	.attr("class", "node")
	.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; })
	.attr("r", 4.5)
	.call(node_drag);
    
    loc_nodes.exit().remove();}


restart();

function redraw() {

	console.log("here", d3.event.translate, d3.event.scale);
	vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

