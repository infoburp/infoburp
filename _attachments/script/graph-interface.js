/*
 * This file provides GraphInterface 
 * 
 * Point in it's creating is to confine d3.js library usage to this object.
 */

goog.provide(infoburp.GraphInterface);

goog.require('infoburp.GraphController');



infoburp.GraphInterface=function(divObject, dataContainer){
    
this.dataContainer=dataContainer;

this.renderDiv=divObject;

this.vis=null;

this.force=null;

this.nodedrag=null;

};



infoburp.GraphInterface.prototype.initGraph=function(){

    
    this.vis=d3.select("#graph").append("svg")
	.on("click", function (e){
		
		if (!(d3.event.target.className=="nodehtml")){
		    
		    this.dataContainer.nodes.forEach(function(d,i){					  
						  d.selected = false;
					      });
	    
		    // Making burp editor inactive; TODO consider Lorem Ipsuming some default text.
		    myField.setHtml("");
		    myField.makeUneditable();
		}
		
	    })
	.attr("width", "100%")
	.attr("height", "100%")
	.attr("pointer-events", "all")    
	.call(d3.behavior.zoom().on("zoom", redraw))
	.append('svg:g');    

    var empty_array = [];
    
    for (var i=0;i<unusedlinks;i++){
	empty_array.push({
			     source:{ x:0,  y:0 },
			     target:{ x:0,  y:0 }
			 });
    };

    vis.selectAll("line.unused_link")
	.data(empty_array)
	.enter()
	.insert("line")
	.attr("class","link unused_link");

    // Standard force layout see https://github.com/mbostock/d3/wiki/Force-Layout for documentation
    this.force = d3.layout.force()
	.linkStrength(linkstrength)
	.gravity(gravity)
	.charge(charge)
	.nodes(this.dataContainer.nodes)
	.links(this.dataContainer.links);




    
    var dragstart=function(d, i){
	force.stop(); // stops the force auto positioning before you start dragging
	
	//    console.log("dragstart",d);
	d.selected=true;
	//    console.log("dragstart end",d,d.selected);
	infoburpGraphController.dragStartHandler(d);   
	//    console.log("dragstart end",d);

    };

    
    var dragmove = function dragmove(d, i){
	
	infoburpGraphController.temporalTick(d3.event.x,d3.event.y);
	
	// Selecting node nearest to mouse event
	infoburpGraphController.selectNearestNode(d,d3.event);
	
	//Making force simulation
	tick_fu();
    };
    
    
    var dragend= function dragend(d, i){
	
     console.log("dragend",d,d.selected);
	// Saving last temporal node coordinates before removing
	var X=infoburpGraphController.temporalNodeArray[0].x;
	var Y=infoburpGraphController.temporalNodeArray[0].y;
	
	
	// Removing temporal link and node
	infoburpGraphController.removeTemporalNodeAndLink();
	console.log("dragend",d,d.selected);
	
	// Adding new link if necessary (function checks if source and target are distinct). 
	//TODO refactor
	if (infoburpGraphController.addNewLink(d)){
	    
	    console.log("dragend after add new link",d,d.selected);
	}
	else{
	    
	    /* And if there where no internode links added then we adding new 
	     * node only if temporal node is far from source
	     */
	    
	    //TODO Refactor.
	    if(infoburpGraphController.addNewNode(d,X,Y)){
		
//		console.log('new node added',d);
		d.selected=false;
		
	    }
	    else{
		
		d.selected=true;		
	    };
	}
	console.log("dragend",d,d.selected);
    
	if (d.selected){
	    //TODO refactor
	    run_node();
	    //document.getElementById("burp-edit").focus();
	    infoBurpController.startEdit(d);
	};

	// Refreshing svg after modifying data
    restart();
	force.start(); 
	
    };
    
    this.node_drag = d3.behavior.drag()
	.on("dragstart", dragstart)
	.on("drag", dragmove)
	.on("dragend", dragend);
    
    
    force.on("tick",tick_fu);
    
    force.start();
    
    
};


infoburp.GraphInterface.prototype.restart=function(){
    
    // Normal links which would reuse pool of unused_links
    this.vis.selectAll("line.link")
	.data(this.dataContainer.links)
	.enter().insert("line")
	.attr("class", "link")
        .call(linkCoordinatesSet);


    

    var nodeSelection = this.vis.selectAll("g.node")
	.data(this.dataContainer.nodes)
	.on("click",function (e){

		/* Stopping propagation of click event so it wouldn't messs with
		 * svg onclick node deselecting
		 */
		d3.event.stopPropagation();
	    }
	    
	   );
    

    var nodeEnter = nodeSelection.enter().append("svg:g")
	.attr("class", "node");
    

    var circles = nodeEnter.append("svg:circle")
	.call(colorCircles)
	.attr("r",NODEINITRADIUS)
	.transition()
	.duration(NODE_APPEARANCE_DURATION)
	.attr("r", NODERADIUS);
    
    // Applying modified drag behaviour to nodes
    nodeEnter.call(this.node_drag);	

    var new_nodes = nodeEnter.append("foreignObject")
	.attr("class", "node")
	.attr("height",FOREIGN_OBJECT_SIDE)
	.attr("width",FOREIGN_OBJECT_SIDE)
	.attr("x",FOREIGN_OBJECT_SHIFT) //so foreign object is inside circle
	.attr("y",FOREIGN_OBJECT_SHIFT);
    
    // Deleting excessive nodes.
    nodeSelection.exit().remove();


    var nodehtmls = new_nodes.append("xhtml:div")
	.attr("class","nodehtml")
	.each(function(d,i){
		  
		  // Initializing render for data
		  infoburpContentTypeHandlerRegistry.attachRender(d);
		  
		  // Rendering data summary to this div
		  d.contentWrapper.summary(this);}
	     )
	.style("opacity",0)
	.transition()
	.duration(NODE_APPEARANCE_DURATION)
	.style("opacity",1);

};


infoburp.GraphInterface.prototype.redraw=function redraw(){
    
    console.log("here", d3.event.translate, d3.event.scale);
    this.vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
};

    
infoburp.GraphInterface.prototype.tick=function tick_fu(){

    this.vis.selectAll("line.link")
        .call(linkCoordinatesSet);

    this.vis.selectAll("line.temporal_link")
        .call(linkCoordinatesSet);

    // Moving all g groups according to data
    this.vis.selectAll("g.node")
	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


    this.vis.selectAll(".nodehtml")
	.filter(function(d){
		    // we are taking only thoose nodes that have html edited 
		    return d.html_need_refresh;
		})
	.each(function(d,i){

		  d.contentWrapper.summary(this);
		  //marking that we refreshed this html
		  d.html_need_refresh=false;
	      });

    this.vis.selectAll("circle.node").call(colorCircles);
};
