goog.provide("infoburp.BurpController");

infoburp.BurpController = function(inputField){

    this.burpData=[];
    this.inputObject=inputField;
    
};


infoburp.BurpController.prototype.nodeEditEndHandle=function(d){
    
    console.log("resetting input_object value");
    
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
  //  this.resetInputObjectState();
    
    // Resetting on blur callback
//    d3.select(this.inputObject).on("blur",function(){});
    
};

infoburp.BurpController.prototype.resetInputObjectState=function(){
/*
    var that=this;
    var inputObjectSelection= d3.select(this.inputObject)
	.data(this.burpData)
	.on("blur", function(d){
		that.nodeEditEndHandle(d.original_data);
	    })
	.on("keypress", function(d){
		
		if (d.original_data.selected){
		    

		    var e = d3.event;
		    if (e.keyCode == 13){
			
			if (e.stopPropagation)	e.stopPropagation();
			e.preventDefault();

			
			infoBurpController.nodeEditEndHandle(d.original_data);			    
		    }
		}
		
	    });

*/	    
};


infoburp.BurpController.prototype.startEdit=function(originalData){
	    
    
        
  	    // TODO remove this fast hack for resetting selected nodes.
	    global_data.nodes.forEach(function(d){d.selected=false;});
	    originalData.selected=true;
             
            this.inputObject.makeEditable();
	    this.burpData=[{original_data:originalData}];
//	    console.log(this.burp_data);

//	    this.resetInputObjectState();

	    this.inputObject.setHtml(false,originalData.nodehtml);

};



