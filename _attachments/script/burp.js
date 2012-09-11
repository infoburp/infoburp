function getBurpController(input){
    return {
	burp_data:[],
	input_object:input,
	youtube_handle: function(d,txt){
	    
	},
	node_edit_end_handle: function(d){
	    if (d.selected){
		

		var txt = this.input_object.value;
		this.input_object.value="";

		console.log(txt);

		//    d.editorActive=false;
		if (txt) {      
		    d.nodehtml = txt;
		}


		attachRender(d);

		console.log(d);
       /*
	    var   node_type = guessNodeType(txt);
	    
	    if ((node_type=="ytvideo-link")||(node_type == "ytvideo-iframe")){

		this.youtube_handle(d,txt);
	
	    }
	    else{
		
		d.showHtml = true;

		d.html_need_refresh=true;

		console.log("resetting is ytv flag ",d);
		d.is_youtube_video=false;
	    } */

		
		d.html_need_refresh=true;

		d.selected=false;
	        tick_fu();


		this.burp_data=[];
		this.reset_input_object_state();
	    }
	    else {
		console.log("trying to edit unselected node",d);
	    }
	},

	reset_input_object_state:function(){

	    var that=this;
	    var input_object_selection= d3.select(input)
		.data(this.burp_data)
		.on("blur", function(d){
			if (d.original_data.selected){
			    
			
			that.node_edit_end_handle(d.original_data);}
			
		    })
		.on("keypress", function(d){

			if (d.original_data.selected){
			    

			    var e = d3.event;
			    if (e.keyCode == 13){
				if (e.stopPropagation)	e.stopPropagation();
				e.preventDefault();
				//  console.log("enter",d);
				BurpController.node_edit_end_handle(d.original_data);			    
			    }
			}

		    });

	    
	},
	
	start_edit:function(original_data){
	    
	    
  	    // TODO remove this fast hack
	    global_data.nodes.forEach(function(d){d.selected=false;});
	    original_data.selected=true;
	    this.burp_data=[{original_data:original_data}];
	    console.log(this.burp_data);

	    this.reset_input_object_state();
	    this.input_object.value=original_data.nodehtml;

	}

    };
};