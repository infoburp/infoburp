TEMPORARY_NODE_CIRCLE_RADIUS=20;

function add_new_link(source_data){

    var yellow_nodes=global_data.nodes.filter(function(d) {
						return d.selected;
					    });
    // If there are selected nodes we get first one and make a link to it


    var there_where_selected_nodes=yellow_nodes.length>0;


    if (there_where_selected_nodes){

	var target = yellow_nodes[0];	    

	var nodes_are_different=source_data.index !== target.index;
	var is_link_not_redundant=link_not_redundant(source_data.index,target.index);

	if ( nodes_are_different && is_link_not_redundant && (GraphController.distance_to_temporal_node(target.x,target.y)<NODERADIUS) ){

	    global_data.links.push({source:source_data,target:target});

	    target.selected = false;
	}
	else{
	    global_data.nodes.forEach(function(d,i){
					  
	//				  console.log("Deselecting all nodes");
					  
					  d.selected = false;});
	
	    target.selected=!nodes_are_different;
	    
	}


    }

    return there_where_selected_nodes;

}


function add_new_node(source_data,X,Y){

    if (GraphController.distance_to_temporal_node(source_data.x,source_data.y)>NODERADIUS ){

	var new_node = new nodetemplate(source_data);

	new_node.x = X; 
	new_node.y = Y;

	global_data.nodes.push( new_node );

	global_data.links.push({
				    source:source_data,
				    target:new_node
				});

	return true;

    }
    else{

	return false;

    };
}


function select_nearest_node(source_data,source_event){

    //Calculating distances to nodes

    var nodes_distances=GraphController.nodes_distances(source_event.x,source_event.y);

    // making all nodes green

//    console.log("Deselecting all node from select nearest node");
  
    global_data.nodes.forEach(function(d){
				  d.selected=false;
			      }
			     );

    // making nearest node yellow if it insider radius of linking
 
    var nearest_node=nodes_distances[0];

//    console.log(nodes_distances);


    var node_is_near=(nearest_node.distance<linkingradius );
   // var nodes_are_different=(nearest_node.node.index !== source_data.index);

    if (node_is_near ){

	nearest_node.node.selected = true;
 
 	GraphController.snap=nearest_node.node;

    }
    else{
	// Removing snapping to the node
	GraphController.snap=null;

    }
}


function link_not_redundant(source_index,target_index){

    var test_function=function(d){
	
	var same_s_index=(d.source.index == source_index);
	var same_t_index=(d.target.index == target_index);
	var same_t_s_index=(d.target.index == source_index);
	var same_s_t_index=(d.source.index == target_index);

	return  same_s_index && same_t_index || same_s_t_index && same_t_s_index;

    };

    return !((global_data.links.filter(test_function)).length >0);
}


function get_graph_controller(vis){
    
    return {

	svg_vis:vis,

	snap:{
	    x:null,
	    y:null
	    },


	temporal_link_array:[],
	temporal_node_array:[],
	
	dragging_now:false,

	state:{
	    dragged_node_number:null
	},

	dragstart_handler:function(d){

//	    console.log("dragstart handler" ,d,d.selected);

	    this.add_temporal_node(d.x,d.y);
	    this.add_temporal_link(d,this.temporal_node_array[0]);
	    this.dragging_now=true;
	    this.refresh_temporal_state();
	    


	},

	add_temporal_node:function(x,y){
	    // This function adds one circle on x y 

	    this.temporal_node_array.push({
					      x:x,
					      y:y,
					      showCircle:true
				     });



	},

	add_temporal_link:function(source,target){

	    // This function adds one line between source and target expecting source and target has x y fields

	    this.temporal_link_array.push({
				     source:source,
				     target:target
				     });



	},

	refresh_temporal_state:function(){

	    // Refreshing view for temporary elements


	    var temporal_node_selection=this.svg_vis.selectAll("circle.temporal_node")
		.data(this.temporal_node_array);

	    temporal_node_selection.enter().insert("circle")
		.attr("class","temporal_node")
		.attr("r",TEMPORARY_NODE_CIRCLE_RADIUS)
		.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });;

	    temporal_node_selection.exit().remove();

	  //  this.temporal_link_array[0].target=this.temporal_node_array[0];

	    var temporal_link_selection=this.svg_vis.selectAll("line.temporal_link")
		.data(this.temporal_link_array);


	    temporal_link_selection.enter().insert("line","circle.temporal_node")
		.attr("class","temporal_link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	    temporal_link_selection.exit().remove();

	},

	remove_temporal_node_and_link:function(){


	    // Dissapearing temporary circle
	    this.svg_vis.selectAll("circle.temporal_node")
		.transition()
		.duration(NODE_APPEARANCE_DURATION/10)
		.style("opacity",0);

	    // Dissapearing and changing color temporary link

	    this.svg_vis.selectAll("line.temporal_link")
		.transition()
		.duration(NODE_APPEARANCE_DURATION/2)
	        .style("stroke-opacity",0);


	    // setTimeout work with global context, so using this workaround

	    var that = this;

	    setTimeout(function(){

			   that.temporal_node_array=[];
			   that.temporal_link_array=[];
			   that.snap=null;
			   that.dragging_now=false;
			   that.refresh_temporal_state();

		       },NODE_APPEARANCE_DURATION);



	},


	temporal_tick:function(x,y){

	    // Updating position for temporal node circle and  link line

	    this.temporal_node_array[0].x=x;
	    this.temporal_node_array[0].y=y;
	    this.svg_vis.selectAll("circle.temporal_node")
		.style("opacity",function(d){
			   if (d.showCircle){
			       return 1;
			   }
			   else
			       {
				   return 0;
			       }

		       })

		.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });


	    if (this.snap !== null){


		this.temporal_link_array[0].target=this.snap;

		this.temporal_node_array[0].showCircle=false;

	    }else{

		this.temporal_link_array[0].target=this.temporal_node_array[0];
		this.temporal_node_array[0].showCircle=true;		
	    }

	    this.svg_vis.selectAll("line.temporal_link")
	    	.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });



	},



	distance_to_node:function(x,y,node_data){

	    X=x-node_data.x;
	    Y=y-node_data.y;

	    return Math.sqrt(X*X+Y*Y);

	},

	distance_to_temporal_node:function(x,y){

	    return this.distance_to_node(x,y,this.temporal_node_array[0]);
	}
	,
	nodes_distances: function(x,y){

	    // This function calculates for all global_data.nodes objects distance to x,y and returns nearest node

	    var distance_array=[];

	    var that=this;

	    global_data.nodes.forEach(function(current,num){

					  distance_array.push({
						node:current,
						index:num,
						distance:that.distance_to_node(x,y,current)
							      }
							     );


				      });



	    distance_array.sort(function(a,b){

				    // We are sorting in descending order so nearest node comes first

				    return (a.distance - b.distance);

				} );

	    return distance_array;

	}

    };
}
