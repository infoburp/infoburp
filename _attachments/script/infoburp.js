LINK_STRENGTH=0.01;
CHARGE =-1000;
GRAVITY=0.0001;

NEW_NODE_TEMPLATE=function(node_html){
    return {
	nodehtml:node_html, 
	showHtml:true,
	selected:false};}; // Making just {} makes awesome bug.

RADIUS_OF_LINKING=100; // Defines distance 

NODE_APPEARANCE_DURATION=500; // ms Time for animation of new node appearance
NODE_APPEARANCE_RADIUS=20;    // px Animation starts from that radius to NODE_RADIUS
NODE_RADIUS=100;              // Node radius

BOTTOM_BUMP_X=NODE_RADIUS*0.866; //sqrt(3)/2 ~ 0.866
BOTTOM_BUMP_Y=NODE_RADIUS/2;

FOREIGHN_OBJECT_SIDE=NODE_RADIUS*1.4142;
FOREIGHN_OBJECT_SHIFT=-NODE_RADIUS/1.4142;

UNUSED_LINK_PULL_SIZE=100; // This is workaround for z order of links. This should be greater than maximum number of links that are displayed.

dragged_node_number=null;
dragged_link_number=null;

var burp_data=[{
    original_data:{
	showHtml:true,
	nodehtml:"Hello,world"
    }
}];



var fill = d3.scale.category20();


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

var vis = d3.select("#graph").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("pointer-events", "all")
    .append('svg:g')
    .call(d3.behavior
	  .zoom()
	  .on("zoom", redraw))
    .append('svg:g');

vis.append("rect").attr("width", "100%").attr("height", "100%");


// Standard force layout see https://github.com/mbostock/d3/wiki/Force-Layout for documentation

var force = d3.layout.force()
    .linkStrength(LINK_STRENGTH)
    .gravity(GRAVITY)
    .charge(CHARGE)
    .nodes(global_data.nodes)
    .links(global_data.links);


var GraphController=null;
// loading GraphController generator

$.getScript("script/graph-controller.js",function(){

		// Setting up GraphController to this visualisation

		GraphController=get_graph_controller(vis);
		
		restart();

	    });


function get_current_active_editor(){
	return vis.selectAll("input.node-editor")
	.filter(function(d){
		    return !d.showHtml;
		}).node();		
    }

function get_current_active_editor_value(){
    
    var current_input=get_current_active_editor();

    if (current_input === null){
	return null;}
    else{
    
    return get_current_active_editor().value;}

}


function node_edit_end_handle(d){
    
    var txt = get_current_active_editor_value();                                   
    
    if (txt){      

	d.nodehtml = txt;
    }
    
    d.showHtml = true;
}

function get_selected_nodes(){

	// Finding selected nodes.
	// TODO use d3.js instead of jquery for filter
	return $.grep(global_data.nodes,
				function(d,n){
				    return d.selected;
				}
				
			   );


};

function select_nearest_node(source_data,source_event){
    
	//Calculating distances to nodes
	var nodes_distances=GraphController.nodes_distances(source_event.x,source_event.y);
	
	// making all nodes green
	global_data.nodes.forEach(function(d){
					  
				      d.selected=false;
				  }
				  
				 );

	
	// making nearest node yellow if it insider radius of linking
    if ((nodes_distances[0].distance<RADIUS_OF_LINKING) &&(nodes_distances[0].node.index !== source_data.index)){
	
	    nodes_distances[0].node.selected=true;
	}


}



function add_new_link(source_data){

    var yellow_nodes=get_selected_nodes();
	
    // If there are selected nodes we get first one and make a link to it
    
    var there_where_selected_nodes=yellow_nodes.length>0;

    if (there_where_selected_nodes){
	
	target=yellow_nodes[0];	    

	if (source_data.index !== target.index){
	    
		global_data.links.push({source:source_data,target:target});
		
	    }
	
	target.selected=false;

    }

    return there_where_selected_nodes;
}


function add_new_node(source_data,X,Y){
    
    if (GraphController.distance_to_temporal_node(source_data.x,source_data.y)>NODE_RADIUS){
	    
	
	var new_node=new NEW_NODE_TEMPLATE(source_data.nodehtml);
	
	new_node.x=X; // We move new node sligthly
	new_node.y=Y;
	global_data.nodes.push(new_node);
	global_data.links.push({source:source_data,target:new_node});
    }
}


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
    vis.selectAll(".nodehtml")
	.html(function(d,i){
		  
		  return d.nodehtml;
		
	      })
	.style("display",function(d){
		   if (d.showHtml){
		       return "block";
		   }
		   else{
		       return "none";
		   }
	       });


    vis.selectAll("circle.node")
	.attr("class",function (d){ if (d.selected || !d.showHtml){
					return "node selected_node";
				    }
				    else{
					return "node unselected_node";
					
				    }
				    
				  });




    vis.selectAll("input")
	.attr("class","node-editor")
	.attr("value",function(d){return d.original_data.nodehtml;})
	.style("display",function(d){
		   if (!d.original_data.showHtml){
		       return "block";
		   }
		   else{
		       return "none";
		   }
	       })
	.on("blur", function(d) {
		
		node_edit_end_handle(d.original_data);

           })
	.on("keypress", function(d) {
	       
               var e = d3.event;
               if (e.keyCode == 13)
	       {
		   
                   if (e.stopPropagation)
		       e.stopPropagation();
                   e.preventDefault();
		   
		   node_edit_end_handle(d.original_data);		   

	       }
           });


    var selected_input = get_current_active_editor();

    if (selected_input===null){}
        else{
	    selected_input.focus();
	}

};

force.on("tick",tick_fu);


force.start();


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
	
    }

    // Selecting node nearest to mouse event
    select_nearest_node(d,d3.event);

    //Making force simulation
    tick_fu();
}

function dragend(d, i) {
    
    // We do this things only if click originated on element that dont't block dragging
    if (!GraphController.blockdragging){
	
	// Saving last temporal node coordinates before removing
	var X=GraphController.temporal_node_array[0].x;
	var Y=GraphController.temporal_node_array[0].y;
	
	// Removing temporal link and node
	GraphController.remove_temporal_node_and_link();
	
	// Adding new link if necessary (function checks if source and target are distinct). 
	if (add_new_link(d)){
	}
	
	else {
	
	    // And if there where no internode links added then we adding new node only if temporal node is far from source
	    
	    add_new_node(d,X,Y);
	}
	
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
   
    
    /* There are some problems with z-order in svg.
       See for example https://github.com/mbostock/d3/issues/252
       So here we creating pool of unused lines with two classe that created before any circles
    */

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
        .attr("r",NODE_APPEARANCE_RADIUS)
	.transition()
	.duration(NODE_APPEARANCE_DURATION)
	.attr("r", NODE_RADIUS);



    nodeEnter.call(node_drag);	


    var new_nodes=nodeEnter.append("foreignObject")
	.attr("class", "node")
	.attr("height",FOREIGHN_OBJECT_SIDE)
	.attr("width",FOREIGHN_OBJECT_SIDE)
        .attr("x",FOREIGHN_OBJECT_SHIFT) //so foreign object is inside circle
	.attr("y",FOREIGHN_OBJECT_SHIFT);

    
    nodeSelection.exit().remove();



    var burp_group=d3.select("#burp").append("svg").append("svg:g").selectAll("g.burp")
	.data(burp_data);

    var burpEnter = burp_group.enter().append("svg:g")
      .attr("class", "burp");

    
    


    var rects=burpEnter
	.append("g:rect")
	.style("stroke","blue")
    	.attr("x",600)
	.attr("y",0)
	.attr("height",FOREIGHN_OBJECT_SIDE)
	.attr("width",FOREIGHN_OBJECT_SIDE);

    var container_foreign=burpEnter
	.append("foreignObject")
	.attr("class","foreign")
	.style("overflow","visible")
	.attr("x",600)
	.attr("y",0)
	.attr("height",FOREIGHN_OBJECT_SIDE)
	.attr("width",FOREIGHN_OBJECT_SIDE);

    var container_html=container_foreign
	.append("xhtml:div")
	.style("overflow","visible")
	.attr("class","container");


    burp_group.append("svg:line")
      .style("stroke","green")
      .style("stroke-width",16)
      .attr("x1",0)
      .attr("x2",100)
      .attr("y1",0)
      .attr("y2",100);



    var nodehtmls=new_nodes.append("xhtml:div")
	.attr("class","nodehtml blockdragging")
        .style("display",function(d){
		   if ( d.showHtml){
		       return "block";
		   }else{
		       return "none";
		   };
	       })
	.html(function(d,i){
		  
		  return d.nodehtml;
		
	      })
        .on("click",function(d){d.showHtml=false; restart();});

    nodehtmls
        .style("opacity",0)
	.transition()
	.duration(NODE_APPEARANCE_DURATION)
	.style("opacity",1);

    //TODO Write more specific selector
    vis.selectAll("div.container").selectAll("input").remove();


    vis.selectAll("div.container")
	.insert("xhtml:input")
	.attr("class","node-editor")
	.attr("value",function(d){console.log("data",d); return d.original_data.nodehtml;})
	.on("blur", function(d) {

		node_edit_end_handle(d.original_data);
	       
           })
	.on("keypress", function(d) { 
	       
               var e = d3.event;
               if (e.keyCode == 13)
	       {
		   
                   if (e.stopPropagation)
		       e.stopPropagation();
                   e.preventDefault();
		   
		   node_edit_end_handle(d.original_data);

		   
	       }
           });




}


function redraw() {

	console.log("here", d3.event.translate, d3.event.scale);
	vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");

}
