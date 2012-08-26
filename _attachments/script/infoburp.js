LINK_STRENGTH=0.01;
CHARGE =-1000;
GRAVITY=0.0001;

NEW_NODE_TEMPLATE=function(){
    return {
	nodehtml:"New node", 
	showHtml:"inline",
	selected:false};}; // Making just {} makes awesome bug.

RADIUS_OF_LINKING=100; // Defines distance 

NODE_RADIUS=100;

BOTTOM_BUMP_X=NODE_RADIUS*0.866; //sqrt(3)/2 ~ 0.866
BOTTOM_BUMP_Y=NODE_RADIUS/2;

FOREIGH_OBJECT_SIDE=NODE_RADIUS*1.4142;

UNUSED_LINK_PULL_SIZE=100; // This is workaround for z order of links. This should be greater than maximum number of links that are displayed.

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
// loading GraphController generator

$.getScript("script/graph-controller.js",function(){
		// Setting up GraphController to this visualisation
		GraphController=get_graph_controller(vis);
	    });


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

    
    // Moving all g groups according to data
    vis.selectAll("g.node")
	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


    // This determines if nodehtml wouldbe hidden when editor appear
    vis.selectAll(".nodehtml").style("display",function(d){return d.showHtml;});
    
    vis.selectAll("circle.node")
	.attr("class",function (d){ if (d.selected){
					return "node selected_node";
				    }
				    else{
					return "node unselected_node";
					
				    }
				    
				  });


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
    
    
    GraphController.dragstart_handler(d,d3.event);

}

    function dragmove(d, i) {

	// We do this things only if click originated on element that dont't block dragging
	if (!GraphController.blockdragging){
	    
	
	    //Moving temp node;
	
	    GraphController.temporal_tick(d3.event.x,d3.event.y);
	
	    //Calculating distances to nodes
	    var nodes_distances=GraphController.nodes_distances(d3.event.x,d3.event.y);

	    // making all nodes green
	    global_data.nodes.forEach(function(d){
					  
					  d.selected=false;
				      }
				      
				     );


	    // making nearest node yellow if it insider radius of linking
	    if (nodes_distances[0].distance<RADIUS_OF_LINKING){
		
		nodes_distances[0].node.selected=true;
	    }
	}
	//Making force simulation
	tick_fu();
    }

function dragend(d, i) {

    // We do this things only if click originated on element that dont't block dragging
    if (!GraphController.blockdragging){

	var X=GraphController.temporal_node_array[0].x;
	var Y=GraphController.temporal_node_array[0].y;
 
	    GraphController.remove_temporal_node_and_link();
    
	// Finding selected nodes.
	var yellow_nodes=$.grep(global_data.nodes,
				function(d,n){
				    return d.selected;
				}
				
			   );
	
	// If there are selected nodes we get first one and make a link to it
	if (yellow_nodes.length>0){
	    
	    target=yellow_nodes[0];
	    global_data.links.push({source:d,target:target});
	
	    target.selected=false;

	}
	else {

	// Adding new node
    
	    var new_node=new NEW_NODE_TEMPLATE();

            new_node.x=X; // We move new node sligthly
            new_node.y=Y;
	    global_data.nodes.push(new_node);
	    global_data.links.push({source:d,target:new_node});
	};
	// Refreshing svg after modifying data
	restart();
    }
    
    else{
	
	//Resetting blockdragging state
	GraphController.blockdragging=false;
	
    }
	
 
    force.start();

};


function restart() {
    
    
    // There are some problems with z-order in svg.
    // https://github.com/mbostock/d3/issues/252
    // So here we creating pool of unused lines with two classe that created before any

    var empty_array=[];
    
    for (var i=0;i<UNUSED_LINK_PULL_SIZE;i++) {
	
	empty_array.push({
			     source:{x:0,y:0},
			     target:{x:0,y:0}
			 });
	

    }
    
    vis.selectAll("line.unused_link")
	.data(empty_array)
	.enter()
	.insert("line")
	.attr("class","link unused_link");


    // Normal links which would reuse pool of unused_links

    vis.selectAll("line.link")
	.data(global_data.links)
	.enter().insert("line")
	.attr("class", "link")
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

    var nodeSelection=vis.selectAll("g.node")
	.data(global_data.nodes);
    
    var nodeEnter = nodeSelection.enter().append("svg:g")
      .attr("class", "node");


    var circles=nodeEnter.append("svg:circle")
	.attr("class",function (d){ if (d.selected){
					return "node selected_node";
				    }
				    else{
					return "node unselected_node";
					
				    }
				    
				  })
	.attr("r",NODE_RADIUS);



    nodeEnter.call(node_drag);	

    var new_nodes=nodeEnter.append("foreignObject")
	.attr("class", "node")
	.attr("height",FOREIGH_OBJECT_SIDE)
	.attr("width",FOREIGH_OBJECT_SIDE)
        .attr("x",-NODE_RADIUS/1.4142) //so foreign object is inside circle
	.attr("y",-NODE_RADIUS/1.4142);

    
    nodeSelection.exit().remove();


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
