goog.provide("infoburp.BurpController");


// TODO refactor this function
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



infoburp.BurpController = function(inputField){

    this.burpData=[];
    this.inputObject=inputField;
    
};


infoburp.BurpController.prototype.nodeEditEndHandle=function(d){
    
    var txt = this.inputObject.getCleanContents();
    this.inputObject.setHtml("");
    
    console.log("txt",txt);
    
    if (txt) {      
	d.nodehtml = txt;
    }
    
    // Trying to guess WAT is that and attach correct render
    infoburpContentTypeHandlerRegistry.attachRender(d);
    
    // Marking node to be refreshed and deselecting it.
    d.html_need_refresh=true;
    d.selected=false;
    
    this.burpData=[];
    
};


infoburp.BurpController.prototype.startEdit=function(originalData){
        
  	    // TODO remove this fast hack for resetting selected nodes.
	    global_data.nodes.forEach(function(d){d.selected=false;});
	    originalData.selected=true;
             
            this.inputObject.makeEditable();
	    this.burpData=[{original_data:originalData}];

	    this.inputObject.setHtml(false,originalData.nodehtml);

};



