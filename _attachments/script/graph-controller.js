TEMPORARY_NODE_CIRCLE_RADIUS=20;

function get_graph_controller(vis){
    
    return {
	
	svg_vis:vis,
	
	blockdragging:false,
	temporal_link_array:[],
	temporal_node_array:[],


	state:{
	    dragged_node_number:null
	},

	dragstart_handler:function(d,ev){

	    // Handle dragstart event and return result if event comes from element that blocking dragging i.e. inner node html.
	    
	    if ($(ev.sourceEvent.srcElement).hasClass("blockdragging")){
		
		// Flag if event come from blockdragging source
		this.blockdragging=true;
		
	    }
	    else{
		
		//Add new temporary node

		this.add_temporal_node(d.x,d.y);
		this.add_temporal_link(d,this.temporal_node_array[0]);
	    }
	    
	    return this.blockdragging;

	    
	},
	
	add_temporal_node:function(x,y){
	    // This function adds one circle on x y 

	    this.temporal_node_array.push({
				     x:x,
				     y:y
				     });

	    this.refresh_temporal_state();
	    
	},
	remove_temporal_node_and_link:function(){

	    this.temporal_node_array=[];
	    this.temporal_link_array=[];
	    this.refresh_temporal_state();

	},
	refresh_temporal_state:function(){

	    // Refreshing view for temporary elements
	    
	    var temporal_node_selection=this.svg_vis.selectAll("circle.temporal_node")
		.data(this.temporal_node_array);

	    temporal_node_selection.enter().insert("circle")
		.attr("class","temporal_node")
		.style("fill","yellow")
		.attr("r",TEMPORARY_NODE_CIRCLE_RADIUS);
	    

	    temporal_node_selection.exit().remove();
	    

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
	
	add_temporal_link:function(source,target){
	    
	    // This function adds one line between source and target expecting source and target has x y fields

	    this.temporal_link_array.push({
				     source:source,
				     target:target
				     });

	   this.refresh_temporal_state();
	    
	    
	},
	temporal_tick:function(x,y){

	    // Updating position for temporal node circle and  link line

	    this.temporal_node_array[0].x=x;
	    this.temporal_node_array[0].y=y;
	    this.svg_vis.selectAll("circle.temporal_node")
		.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });


	    this.svg_vis.selectAll("line.temporal_link")
	    	.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
	    


	},
	
	nodes_distances: function(x,y){

	    // This function calculates for all global_data.nodes objects distance to x,y and returns nearest node

	    var distance_array=[];

	    global_data.nodes.forEach(function(current,num){
					  
					  X=x-current.x;
					  Y=y-current.y;
					  
					  distance_array.push({
						node:current,
						index:num,
						distance:Math.sqrt(X*X+Y*Y)
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