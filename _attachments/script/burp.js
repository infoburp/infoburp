function getBurpController(input){

    return {
	
	
	burp_data:[],

	input_object:input,


	node_edit_end_handle: function(d){
    
	    var txt = this.end_edit();                                   
	    
	    console.log(txt);
	    d.editorActive=false;
	    
	    if (txt){      
	
		d.nodehtml = txt;
	    }
	    
	    d.showHtml = true;
	    d.selected=false;
	},


	start_edit:function(original_data){

	    
	    // TODO remove this fast hack

	    global_data.nodes.forEach(function(d){d.selected=false;});
	    
	    original_data.selected=true;
	    
	    
	    this.burp_data=[{original_data:original_data}];

	    console.log(this.burp_data);
	    
	    var that=this;

	    var input_object_selection= d3.select(input)
		.data(this.burp_data)
		.on("blur", function(d) {
		    
			that.node_edit_end_handle(d.original_data);
			
		    })
		.on("keypress", function(d) { 
	       
			var e = d3.event;
			if (e.keyCode == 13)
			{
			    
			    if (e.stopPropagation)
				e.stopPropagation();
			    e.preventDefault();
			
			  //  console.log("enter",d);
			    BurpController.node_edit_end_handle(d.original_data);
			    
			    
			}

			
		    });


	    this.input_object.value=original_data.nodehtml;


	},
	
	end_edit:function(){

//	    console.log("inner text",this.input_object.innerText);

	    to_return=this.input_object.value;
	    this.input_object.value="";
	    return to_return;
	
	}
	
    };

    
};