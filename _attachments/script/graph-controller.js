
TEMPORARY NODE CIRCLE RADIUS=20;
function get graph controller(vis)
	{   
		return {
			svg vis:vis,snap:
				{
					x:null,y:null
				},
				blockdragging:false,
				temporal link array:[],
				temporal node array:[],
			state:{
	    dragged node number:null
	},

	dragstart handler:function(d,ev){

	    // Handle dragstart event and return result if event comes from element that blocking dragging i.e. inner node html.

	    if ($(ev.sourceEvent.srcElement).hasClass("blockdragging")){

		// Flag if event come from blockdragging source
		this.blockdragging=true;

	    }
	    else{

		//Add new temporary node

		this.add temporal node(d.x,d.y);
		this.add temporal link(d,this.temporal node array[0]);
	    }

	    return this.blockdragging;


	},

	add temporal node:function(x,y){
	    // This function adds one circle on x y 

	    this.temporal node array.push({
					      x:x,
					      y:y,
					      showCircle:true
				     });

	    this.refresh temporal state();

	},
	remove temporal node and link:function(){


	    // Dissapearing temporary circle
	    this.svg vis.selectAll("circle.temporal node")
		.transition()
		.duration(NODE APPEARANCE DURATION/10)
		.style("opacity",0);

	    // Dissapearing and changing color temporary link

	    this.svg vis.selectAll("line.temporal link")
		.transition()
		.duration(NODE APPEARANCE DURATION/2)
	        .style("stroke-opacity",0);


	    // setTimeout work with global context, so this workaround

	    var that =this;

	    setTimeout(function(){
			   that.temporal node array=[];
			   that.temporal link array=[];
			   this.snap=null;
			   that.refresh temporal state();
		       },NODE APPEARANCE DURATION);



	},
	refresh temporal state:function(){

	    // Refreshing view for temporary elements


	    var temporal node selection=this.svg vis.selectAll("circle.temporal node")
		.data(this.temporal node array);

	    temporal node selection.enter().insert("circle")
		.attr("class","temporal node")
		.attr("r",TEMPORARY NODE CIRCLE RADIUS)
		.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });;

	    temporal node selection.exit().remove();

	  //  this.temporal link array[0].target=this.temporal node array[0];

	    var temporal link selection=this.svg vis.selectAll("line.temporal link")
		.data(this.temporal link array);


	    temporal link selection.enter().insert("line","circle.temporal node")
		.attr("class","temporal link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	    temporal link selection.exit().remove();

	},

	add temporal link:function(source,target){

	    // This function adds one line between source and target expecting source and target has x y fields

	    this.temporal link array.push({
				     source:source,
				     target:target
				     });

	   this.refresh temporal state();


	},
	temporal tick:function(x,y){

	    // Updating position for temporal node circle and  link line

	    this.temporal node array[0].x=x;
	    this.temporal node array[0].y=y;
	    this.svg vis.selectAll("circle.temporal node")
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


		this.temporal link array[0].target=this.snap;

		this.temporal node array[0].showCircle=false;

	    }else{

		this.temporal link array[0].target=this.temporal node array[0];
		this.temporal node array[0].showCircle=true;		
	    }

	    this.svg vis.selectAll("line.temporal link")
	    	.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });



	},



	distance to node:function(x,y,node data){

	    X=x-node data.x;
	    Y=y-node data.y;

	    return Math.sqrt(X*X+Y*Y);

	},

	distance to temporal node:function(x,y){

	    return this.distance to node(x,y,this.temporal node array[0]);
	}
	,
	nodes distances: function(x,y){

	    // This function calculates for all global data.nodes objects distance to x,y and returns nearest node

	    var distance array=[];

	    var that=this;

	    global data.nodes.forEach(function(current,num){

					  distance array.push({
						node:current,
						index:num,
						distance:that.distance to node(x,y,current)
							      }
							     );


				      });



	    distance array.sort(function(a,b){

				    // We are sorting in descending order so nearest node comes first

				    return (a.distance - b.distance);

				} );

	    return distance array;

	}

    };
}
