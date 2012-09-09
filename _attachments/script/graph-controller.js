TEMPORARY_NODE_CIRCLE_RADIUS=20;
function get_graph_controller(vis)
	{
    	return
    		{
			svg_vis:vis,snap:
					{
						x:null,y:null
					},
			blockdragging:false,
			temporal_link_array:[],
			temporal_node_array:[],
			state:
				{
					dragged_node_number:null
				},
	dragstart_handler:function(d,ev)
		{
			// Handle dragstart event and return result if event comes from element that blocking dragging i.e. inner node html.
			if ($(ev.sourceEvent.srcElement).hasClass("blockdragging"))
				{
					// Flag if event come from blockdragging source
					this.blockdragging=true;
				}
			else
				{
					//Add new temporary node
					this.add_temporal_node(d.x,d.y);
					this.add_temporal_link(d,this.temporal_node_array[0]);
				}    
			return this.blockdragging;
		},
	add_temporal_node:function(x,y)
		{
			// This function adds one circle on x y 
			this.temporal_node_array.push
				({
					x:x,
					y:y,
					showCircle:true
				});
		    	this.refresh_temporal_state();
		},
	remove_temporal_node_and_link:function()
		{
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
			// setTimeout work with global context, so this workaround
			var that =this; 
			setTimeout
				(function()
					{
						that.temporal_node_array=[];
						that.temporal_link_array=[];
						this.snap=null;
						that.refresh_temporal_state();
					},NODE_APPEARANCE_DURATION
				); 
		},
	refresh_temporal_state:function()
		{
			// Refreshing view for temporary elements
			var temporal_node_selection=this.svg_vis.selectAll("circle.temporal_node")
				.data(this.temporal_node_array);
			temporal_node_selection.enter().insert("circle")
				.attr("class","temporal_node")
				.attr("r",TEMPORARY_NODE_CIRCLE_RADIUS)
				.attr("transform", 
					function(d) 
						{
							return "translate(" + d.x + "," + d.y + ")"; 
						});;
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
	add_temporal_link:function(source,target)
		{  
			// This function adds one line between source and target expecting source and target has x y fields
			this.temporal_link_array.push
				({
					source:source,
					target:target
				});
			this.refresh_temporal_state(); 
		},
	temporal_tick:function(x,y)
		{
			// Updating position for temporal node circle and  link line
			this.temporal_node_array[0].x=x;
			this.temporal_node_array[0].y=y;
			this.svg_vis.selectAll("circle.temporal_node")
				.style("opacity",
				function(d)
					{
						if (d.showCircle)
							{
								return 1;
			   				}
						else
							{
				   			return 0;
				   			}
		       			})
			.attr("transform", 
				function(d) 
					{
						return "translate(" + d.x + "," + d.y + ")";
					});
	if (this.snap !== null)
		{
			this.temporal_link_array[0].target=this.snap;
			this.temporal_node_array[0].showCircle=false;
		}
	else
		{
			this.temporal_link_array[0].target=this.temporal_node_array[0];
			this.temporal_node_array[0].showCircle=true;		
		}
	this.svg_vis.selectAll("line.temporal_link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
	},
distance_to_node:
function(x,y,node_data)
	{
		X=x-node_data.x;
		Y=y-node_data.y;
		return Math.sqrt(X*X+Y*Y);
	},
distance_to_temporal_node:
function(x,y)
	{
		return this.distance_to_node(x,y,this.temporal_node_array[0]);
	},
nodes_distances:
	function(x,y)
		{
			// This function calculates for all global_data.nodes objects distance to x,y and returns nearest node
			var distance_array=[];
			var that=this;
			global_data.nodes.forEach
				(function(current,num)
					{
						distance_array.push
						({
							node:current,
							index:num,
							distance:that.distance_to_node(x,y,current)
						}); 
					});
				distance_array.sort
					(function(a,b)
						{
							// We are sorting in descending order so nearest node comes first
							return (a.distance - b.distance);
						});
			return distance_array;
		}
	};
}