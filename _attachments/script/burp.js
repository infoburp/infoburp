function getBurpController(input){
    return {
	burp_data:[],
	input_object:input,

	node_edit_end_handle: function(d){

		console.log("resetting input_object value");

		var txt = this.input_object.value;
		this.input_object.value="";
		
		console.log("txt",txt);

		if (txt) {      
		    d.nodehtml = txt;
		}

		// Trying to guess WAT is that and attach correct render
		attachRender(d);

		// Marking node to be refreshed and deselecting it.
		d.html_need_refresh=true;
		d.selected=false;

		this.burp_data=[];
		this.reset_input_object_state();

	        // Resetting on blur callback
	        d3.select(this.input_object).on("blur",function(){});
		console.log("trying to edit unselected node",d);

	},

	reset_input_object_state:function(){

	    var that=this;
	    var input_object_selection= d3.select(input)
		.data(this.burp_data)
		.on("blur", function(d){
			that.node_edit_end_handle(d.original_data);
		    })
		.on("keypress", function(d){

			if (d.original_data.selected){
			    

			    var e = d3.event;
			    if (e.keyCode == 13){

				if (e.stopPropagation)	e.stopPropagation();
				e.preventDefault();


				BurpController.node_edit_end_handle(d.original_data);			    
			    }
			}

		    });

	    
	},
	
	start_edit:function(original_data){
	    
	    
  	    // TODO remove this fast hack for resetting selected nodes.
	    global_data.nodes.forEach(function(d){d.selected=false;});
	    original_data.selected=true;

	    this.burp_data=[{original_data:original_data}];
//	    console.log(this.burp_data);

	    this.reset_input_object_state();
	    this.input_object.value=original_data.nodehtml;

	}

    };
};