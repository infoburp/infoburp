goog.provide('infoburp.startInterface');
goog.provide('infoburp');


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
var gravity = 0;
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
unusedlinks = 256; // This is workaround for z order of links. This should be greater than maximum number of links that are displayed.


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
var infoBurpController2=null;
var infoburpContentTypeHandlerRegistry=null;
var graphInterface=null;

var myField = null;



infoburp.startInterface= function startInterface(){
    
    graphInterface=new infoburp.GraphInterface(document.getElementById("graph"),global_data);    

    initEditor();
    initEditor2();
    myField.makeUneditable();
    myField2.makeUneditable();
    infoBurpController = new infoburp.BurpController(myField, myField2);

    infoburpContentTypeHandlerRegistry=new infoburp.Content.ContentTypeHandlersRegistry();
    infoburpContentTypeHandlerRegistry.defaultInit();

    graphInterface.initGraph();

};
