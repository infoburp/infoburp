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




var infoBurpController=null;
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

    infoburpContentTypeHandlerRegistry=new infoburp.Content.ContentTypeHandlersRegistry();
    infoburpContentTypeHandlerRegistry.defaultInit();

    graphInterface.initGraph();

};