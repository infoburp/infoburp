goog.require('infoburp.GraphController');
goog.require('infoburp.BurpController');

goog.require('infoburp.GraphInterface');

goog.require('infoburp.Content.ContentTypeHandlersRegistry');
goog.require('goog.editor.Field');

goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.RemoveFormatting');
goog.require('goog.editor.plugins.UndoRedo');
goog.require('goog.editor.plugins.ListTabHandler');
goog.require('goog.editor.plugins.SpacesTabHandler');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.plugins.HeaderFormatter');
goog.require('goog.editor.plugins.LoremIpsum');
goog.require('goog.editor.plugins.LinkDialogPlugin');
goog.require('goog.editor.plugins.LinkBubble');
goog.require('goog.editor.Command');
goog.require('goog.ui.editor.DefaultToolbar');
goog.require('goog.ui.editor.ToolbarController');






var linkstrength = 0.1;
var charge = -2000;
var gravity = 0.0001;
var nodetemplate;

nodetemplate = function(node_data){
    return {
	nodehtml:node_data.nodehtml,
	html_need_refresh:true,
	editorActive:false,
	selected:false,
	is_youtube_video:node_data.is_youtube_video,
	youtube_id:node_data.youtube_id
    };
    
}; // Making just {} makes awesome bug.


DEBUG_DATASET={
	         nodes:[nodetemplate({
					
					nodehtml:"infoburp.com",
					is_youtube_video:false,
					youtube_id:""
				    }

		       )


		],
    		
    		links:[ ]
    
	};


linkingradius = 128; // Defines linking distance 
NODE_APPEARANCE_DURATION = 128; // ms Time for animation of new node appearance
NODEINITRADIUS = 20;    // px Animation starts from that radius to noderadius
NODERADIUS = 46;              // Node radius
BOTTOM_BUMP_X = NODERADIUS*0.866; //sqrt(3)/2 ~ 0.866
BOTTOM_BUMP_Y = NODERADIUS/2;
FOREIGN_OBJECT_SIDE = NODERADIUS*1.4142;
FOREIGN_OBJECT_SHIFT = -NODERADIUS/1.4142;
unusedlinks = 100; // This is workaround for z order of links. This should be greater than maximum number of links that are displayed.


global_data = {

    nodes:[], 
    links:[]

};
/*
var vis=d3.select("#graph").append("svg")
    .on("click", function (e){
	       
	    console.log(d3.event,d3.event.target.className);
	if (!(d3.event.target.className=="nodehtml")){
	    

	    global_data.nodes.forEach(function(d,i){
					  
					  console.log("Deselecting all nodes");
					  d.selected = false;
					  
				      });
	    

	    myField.setHtml("");
	    myField.makeUneditable();
	   // document.getElementById("burp-edit").blur();
	}

    })
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("pointer-events", "all")    
    .call(d3.behavior.zoom().on("zoom", redraw))
    .append('svg:g');
    
*/
if (COUCHDB) {

    var previous_graph_state = restore_graph_state();// persistence/basic_persistence.js

    global_data.nodes = previous_graph_state.nodes;
    global_data.links = restore_links(previous_graph_state);

}
else {

    global_data.nodes = DEBUG_DATASET.nodes;


    // Putting all nodes around center of svg.

    (function() {
		 global_data.nodes.forEach(function(d){
					       var Y=300;//vis.node().viewportElement.clientHeight/2;
					       var X=200;//vis.node().viewportElement.clientWidth/2;
					       d.x=X+Math.round(Math.random()*10 -5);
					       d.y=Y+Math.round(Math.random()*10 -5);
					       //console.log(X,Y,d,vis.node().viewportElement.clientWidth);
					   });
		
		})();


    global_data.links = DEBUG_DATASET.links;

}


/* 
 * There are some problems with z-order in svg.
 * See for example https://github.com/mbostock/d3/issues/252
 * So here we creating pool of unused lines with two classes that created before any circles
 */

/*
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
var force = d3.layout.force()
	.linkStrength(linkstrength)
	.gravity(gravity)
	.charge(charge)
	.nodes(global_data.nodes)
	.links(global_data.links);


console.log(document.getElementById("burp-edit"));
*/

function linkCoordinatesSet(linkSelection){

    linkSelection.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
}

function colorCircles(circlesSelection){
    
    circlesSelection.attr("class",function (d){
			      if (d.selected){
				  
				  return "node selected_node";
				  
			      }
			      else{
		    
				  return "node unselected_node";
			      }
			  });
}

/*
function tick_fu(){

    vis.selectAll("line.link")
        .call(linkCoordinatesSet);

    vis.selectAll("line.temporal_link")
        .call(linkCoordinatesSet);

    // Moving all g groups according to data
    vis.selectAll("g.node")
	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


    vis.selectAll(".nodehtml")
	.filter(function(d){
		    // we are taking only thoose nodes that have html edited 
		    return d.html_need_refresh;
		})
	.each(function(d,i){

		  d.contentWrapper.summary(this);
		  //marking that we refreshed this html
		  d.html_need_refresh=false;
	      });

    vis.selectAll("circle.node").call(colorCircles);
};

/*
force.on("tick",tick_fu);

force.start();

var node_drag = d3.behavior.drag()
		.on("dragstart", dragstart)
		.on("drag", dragmove)
		.on("dragend", dragend);

*/
/*
function dragstart(d, i){
    force.stop(); // stops the force auto positioning before you start dragging

//    console.log("dragstart",d);
    d.selected=true;
//    console.log("dragstart end",d,d.selected);
   infoburpGraphController.dragStartHandler(d);   
//    console.log("dragstart end",d);

}


function dragmove(d, i){

    infoburpGraphController.temporalTick(d3.event.x,d3.event.y);

    // Selecting node nearest to mouse event
    infoburpGraphController.selectNearestNode(d,d3.event);
    
    //Making force simulation
    tick_fu();
}


function dragend(d, i){

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
	    
/*	    //TODO Refactor.
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


function restart(){
    

    // Normal links which would reuse pool of unused_links
    vis.selectAll("line.link")
	.data(global_data.links)
	.enter().insert("line")
	.attr("class", "link")
        .call(linkCoordinatesSet);


    

    var nodeSelection = vis.selectAll("g.node")
	.data(global_data.nodes)
	.on("click",function (e){

		/* Stopping propagation of click event so it wouldn't messs with
		 * svg onclick node deselecting
		 */
/*		d3.event.stopPropagation();
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
    nodeEnter.call(node_drag);	

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


}


function redraw(){
    
    console.log("here", d3.event.translate, d3.event.scale);
    vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

*/
var infoBurpController=null;
var infoburpGraphController=null;
var infoburpContentTypeHandlerRegistry=null;
var graphInterface=null;

var myField = null;

function initEditor(){

      
  function updateFieldContents() {

      
      var valedit=myField.getCleanContents();
      goog.dom.getElement('fieldContents').value = valedit;

      global_data.nodes
	  .filter(function(d,i){
		      return d.selected;
		  }).forEach(function(d){

				 d.nodehtml=myField.getCleanContents();
				 infoburpContentTypeHandlerRegistry.attachRender(d);
				 d.html_need_refresh=true;
				 graphInterface.tickClosure()();


			     });

      if (heuristicEngine.guessNodeType(valedit)=="ytvideo-link"){
	  
	  //	console.log("Yes this is a youtube-link",testIfYTLink(valedit)[1]);
	  //	render_youtube_video_to_div(document.getElementById("run-node"),testIfYTLink(valedit)[1],400,400);
      };	
      global_data.nodes
	  .filter(function(d,i){
		      return d.selected;
		  })
	  .forEach(function(d){
		     
		       //		     console.log("We found this data of selected node and trying to render it",d);
		     
		       d.contentWrapper.primary(document.getElementById("run-node"));
		       
		   });
  }

  // Create an editable field.

  myField=new goog.editor.Field('burpEdit');
  // Create and register all of the editing plugins you want to use.
  myField.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  myField.registerPlugin(new goog.editor.plugins.RemoveFormatting());
  myField.registerPlugin(new goog.editor.plugins.UndoRedo());
  myField.registerPlugin(new goog.editor.plugins.ListTabHandler());
  myField.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
  myField.registerPlugin(new goog.editor.plugins.EnterHandler());
  myField.registerPlugin(new goog.editor.plugins.HeaderFormatter());
  myField.registerPlugin(
      new goog.editor.plugins.LoremIpsum('Click here to edit'));
  myField.registerPlugin(
      new goog.editor.plugins.LinkDialogPlugin());
  myField.registerPlugin(new goog.editor.plugins.LinkBubble());

  // Specify the buttons to add to the toolbar, using built in default buttons.
  var buttons = [
    goog.editor.Command.BOLD,
    goog.editor.Command.ITALIC,
    goog.editor.Command.UNDERLINE,
    goog.editor.Command.FONT_COLOR,
    goog.editor.Command.BACKGROUND_COLOR,
    goog.editor.Command.FONT_FACE,
    goog.editor.Command.FONT_SIZE,
    goog.editor.Command.LINK,
    goog.editor.Command.UNDO,
    goog.editor.Command.REDO,
    goog.editor.Command.UNORDERED_LIST,
    goog.editor.Command.ORDERED_LIST,
    goog.editor.Command.INDENT,
    goog.editor.Command.OUTDENT,
    goog.editor.Command.JUSTIFY_LEFT,
    goog.editor.Command.JUSTIFY_CENTER,
    goog.editor.Command.JUSTIFY_RIGHT,
    goog.editor.Command.SUBSCRIPT,
    goog.editor.Command.SUPERSCRIPT,
    goog.editor.Command.STRIKE_THROUGH,
    goog.editor.Command.REMOVE_FORMAT
  ];
  var myToolbar = goog.ui.editor.DefaultToolbar.makeToolbar(buttons,
      goog.dom.getElement('toolbar'));

  // Hook the toolbar into the field.
  var myToolbarController =
      new goog.ui.editor.ToolbarController(myField, myToolbar);

  // Watch for field changes, to display below.
  goog.events.listen(myField, goog.editor.Field.EventType.DELAYEDCHANGE,
      updateFieldContents);

  myField.makeEditable();
  updateFieldContents();
}


function startInterface(){
    
    graphInterface=new infoburp.GraphInterface(document.getElementById("graph"),global_data);    
    

    initEditor();
    myField.makeUneditable();
    infoBurpController = new infoburp.BurpController(myField);
//    infoburpGraphController= new infoburp.GraphController(vis);

    infoburpContentTypeHandlerRegistry=new infoburp.Content.ContentTypeHandlersRegistry();
    infoburpContentTypeHandlerRegistry.defaultInit();
    graphInterface.initGraph();

//    restart();
};