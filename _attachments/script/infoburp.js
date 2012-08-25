//DISTANCE=20;


LINK_STRENGTH=0.01;
CHARGE =-1000;
GRAVITY=0.0001;

NEW_NODE_TEMPLATE=function(){return {nodehtml:"New node", showHtml:"inline",nodecolor:"green"};}; // Making just {} makes awesome bug.

RADIUS_OF_LINKING=100; // Defines distance 

NODE_RADIUS=100;

BOTTOM_BUMP_X=NODE_RADIUS*0.866; //sqrt(3)/2 ~ 0.866
BOTTOM_BUMP_Y=NODE_RADIUS/2;

FOREIGH_OBJECT_SIDE=NODE_RADIUS*1.4142;


dragged_node_number=null;
dragged_link_number=null;


var width = 900, 
    height = 1500, 
    fill = d3.scale.category20();



global_data={nodes:[], links:[]};

if (COUCHDB){
    var previous_graph_state = restore_graph_state();// persistence/basic_persistence.js
    global_data.nodes = previous_graph_state.nodes;
    global_data.links = restore_links(previous_graph_state);
}
else{
    global_data.nodes = DEBUG_DATASET.nodes;
    global_data.links = DEBUG_DATASET.links;

    
}

var vis = d3.select("#chart").append("svg").attr("width", width).attr("height", height).attr("pointer-events", "all").append('svg:g').call(d3.behavior.zoom().on("zoom", redraw)).append('svg:g');

vis.append("rect").attr("width", width).attr("height", height);

var force = d3.layout.force()
    .linkStrength(LINK_STRENGTH)
    .gravity(GRAVITY)
    .charge(CHARGE)
    .nodes(global_data.nodes)
    .links(global_data.links)
    .size([width, height]);

var cursor = vis.append("circle").attr("r", 0).attr("transform", "translate(-100,-100)").attr("class", "cursor");




var GraphController=null;

$.getScript("script/graph-controller.js",function(){GraphController=get_graph_controller(vis);});

//console.log(GraphController);

// loading insert_editor function
$.getScript("script/node-editor/node-editor.js",restart);






function tick_fu() {
    
    vis.selectAll("line.link")
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
    

    vis.selectAll("line.temporal_link")
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

    
    vis.selectAll("g.node")
	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    vis.selectAll(".nodehtml").style("display",function(d){return d.showHtml;});
    
    vis.selectAll("circle.node")
	.style("fill",function(d){return d.nodecolor;});
//	vis.selectAll("g.node")
//	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


    };

force.on("tick",tick_fu);


force.start();

vis.on("mousemove", function() {
	cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
});


var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
        

function dragstart(d, i) {
    force.stop(); // stops the force auto positioning before you start dragging
    
    GraphController.add_temporal_node(d.x,d.y);
    GraphController.add_temporal_link(d,GraphController.temporal_node_array[0]);


//    console.log(!$(d3.event.sourceEvent.srcElement).hasClass("blockdragging"));
    
//    console.log(d3.event.sourceEvent.srcElement, d);

//    if ( $(d3.event.sourceEvent.srcElement).hasClass("blockdragging") ) {alert("Blockdragging")}



}

    function dragmove(d, i) {

	//Moving temp node;
	
	GraphController.temporal_tick(d3.event.x,d3.event.y);

	var nodes_distances=GraphController.nodes_distances(d3.event.x,d3.event.y);

	// making all nodes green
	global_data.nodes.forEach(function(d){

				      d.nodecolor="green";
				      }
				  
	);


	// making nearest node yellow if it insider radius of linking
	if (nodes_distances[0].distance<RADIUS_OF_LINKING){
	    
	    nodes_distances[0].node.nodecolor="yellow";
	}

	//Making force simulation
	tick_fu();
    }

function dragend(d, i) {


    GraphController.remove_temporal_node_and_link();
    
    var yellow_nodes=$.grep(global_data.nodes,
			    function(d,n){
				return d.nodecolor=="yellow";
				}
			  
			   );
    
// If node yellow we make a link to it
    if (yellow_nodes.length>0){

//	var target=nodes_distances[0].node;
//	console.log("Distance less than ROL target=",target,"link before ",global_data.links[dragged_link_number]);
	//global_data.links[dragged_link_number].target=target;
	target=yellow_nodes[0];
	global_data.links.push({source:d,target:target});
	
	target.nodecolor="green";
	console.log(" link after ",global_data.links[dragged_link_number]);

	restart();
	
    }
    else {

	// Adding new node
    
	var new_node=new NEW_NODE_TEMPLATE();

        new_node.x=d.x+5;
        new_node.y=d.y;
	global_data.nodes.push(new_node);

	global_data.links.push({source:d,target:new_node});
	restart();
};

	force.start();

};


function addBump(g_collection,radius,xshift,yshift){

    g_collection.append("svg:circle")
	.attr("class","node")
    .style('fill','green')
        .attr("cx",xshift)
        .attr("cy",yshift)
        .attr("r",radius);
}




function restart() {

    var nodeSelection=vis.selectAll("g.node")
	.data(global_data.nodes);
    
    var nodeEnter = nodeSelection.enter().append("svg:g")
      .attr("class", "node");


    var circles=nodeEnter.append("svg:circle")
	.attr("class","node")
        .style("fill",function(d){return d.node_color;})
	.attr("r",NODE_RADIUS);

      nodeEnter.call(node_drag);	

// Adding bumps

    //Right
    addBump(nodeEnter,NODE_RADIUS/3,BOTTOM_BUMP_X,BOTTOM_BUMP_Y);

    //Left

    addBump(nodeEnter,NODE_RADIUS/3,-BOTTOM_BUMP_X,BOTTOM_BUMP_Y);
    
    //Top

    addBump(nodeEnter,NODE_RADIUS/3,0,-NODE_RADIUS);



    var new_nodes=nodeEnter.append("foreignObject")
	.attr("class", "node")
	.attr("height",FOREIGH_OBJECT_SIDE)
	.attr("width",FOREIGH_OBJECT_SIDE)
        .attr("x",-NODE_RADIUS/1.4142) //so foreign object is inside circle
	.attr("y",-NODE_RADIUS/1.4142);

    
    nodeSelection.exit().remove();



    vis.selectAll("line.link")
	.data(global_data.links)
	.enter().insert("line", "foreighnObject.node")
	.attr("class", "link")
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

    new_nodes.append("xhtml:div")
	.attr("class","nodehtml blockdragging")
	.style("height",FOREIGH_OBJECT_SIDE)
	.style("width",FOREIGH_OBJECT_SIDE)
        .style("display",function(d){return d.showHtml;})
	.html(function(d,i){return "nodehtml=" +d.nodehtml+i;
			 })
        .on("click",insert_editor);	

}



function redraw() {

	console.log("here", d3.event.translate, d3.event.scale);
	vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}
