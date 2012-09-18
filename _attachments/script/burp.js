goog.provide('ib.BurpController');



ib.BurpController = function() {

    this.burpData = [];
    this.inputObject = this.initEditor('fieldContents','burpEdit','toolbar','runNode');
    this.inputObject2 = this.initEditor('fieldContents2','burpEdit2','toolbar2','runNode2');

};






ib.BurpController.prototype.initEditor = function initEditor(fieldContents,burpEdit,toolbar,runNode) {


  function updateFieldContents() {

      var valedit = baseField.getCleanContents();

      console.log(valedit, 'cleancontents');

      goog.dom.getElement(fieldContents).value = valedit;

      global_data.nodes
        .filter(function(d, i) {
            return d.selected;
         }).forEach(function(d) {
             d.nodehtml = baseField.getCleanContents();
             //infoburpContentTypeHandlerRegistry.attachRender(d);
             //d.html_need_refresh = true;
             //graphInterface.tickClosure()();
          });

    $('#infoburp').removeClass('editing');
  }

  // Create an editable field.

  var baseField = new goog.editor.Field(burpEdit);
  // Create and register all of the editing plugins you want to use.
  baseField.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  baseField.registerPlugin(new goog.editor.plugins.RemoveFormatting());
  baseField.registerPlugin(new goog.editor.plugins.UndoRedo());
  baseField.registerPlugin(new goog.editor.plugins.ListTabHandler());
  baseField.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
  baseField.registerPlugin(new goog.editor.plugins.EnterHandler());
  baseField.registerPlugin(new goog.editor.plugins.HeaderFormatter());
  baseField.registerPlugin(
      new goog.editor.plugins.LoremIpsum('Click here to edit'));
  baseField.registerPlugin(
      new goog.editor.plugins.LinkDialogPlugin());
  baseField.registerPlugin(new goog.editor.plugins.LinkBubble());

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
      goog.dom.getElement(toolbar));

  // Hook the toolbar into the field.
  var myToolbarController =
      new goog.ui.editor.ToolbarController(baseField, myToolbar);

  // Watch for field changes, to display below.
  goog.events.listen(baseField, goog.editor.Field.EventType.DELAYEDCHANGE,
      updateFieldContents);

  baseField.makeEditable();
  updateFieldContents();

  return baseField;
};




ib.BurpController.prototype.nodeEditEndHandle = function(d) {

    var txt = this.inputObject.getCleanContents();
    this.inputObject.setHtml('');
    this.inputObject2.setHtml('');

    console.log('txt', txt);

    if (txt) {
        d.nodehtml = txt;
    }

    // Trying to guess WAT is that and attach correct render
    infoburpContentTypeHandlerRegistry.attachRender(d);

    // Marking node to be refreshed and deselecting it.
    d.html_need_refresh = true;
    d.selected = false;

    this.burpData = [];

};


ib.BurpController.prototype.startEdit = function(originalData) {

    // TODO remove this fast hack for resetting selected nodes.
    global_data.nodes.forEach(function(d) {d.selected = false;});
    originalData.selected = true;

    (this.inputObject.isUneditable()) ? this.inputObject.makeEditable() : console.log('Trying to make editable already editable field');
    (this.inputObject2.isUneditable()) ? this.inputObject2.makeEditable() : console.log('Trying to make editable already editable field');

    this.burpData = [{original_data: originalData}];

    this.inputObject.setHtml(false, originalData.nodehtml);
    this.inputObject2.setHtml(false,originalData.nodehtml);

    $('#infoburp').addClass('editing');
    $('#_middleBar').draggable({
        axis: 'y',
        start: function(e, ui){
          $('#graph').attr('initialHeight', $('#graph').height());
        },
        drag: function(e, ui){
          var amount = parseInt(ui.position.top);
          var initial = parseInt($('#graph').attr('initialHeight'));
          $('#graph').css('height', initial+amount);
        },
        stop: function(e, ui){
          $(this).css('left', 0);
          $(this).css('top', 0);
        }
    });
};

