function getBurpController(input){
    return {
	burp_data:[],
	input_object:input,
	youtube_handle: function(d,txt){

	    console.log(txt);
	    var regex_link = /http\:\/\/www\.youtube\.com\/watch\?v=(.{11})/;
	    var regex_iframe=/<iframe.+http\:\/\/www\.youtube\.com\/embed\/(.{11}).+iframe>/;

	    var id_array = txt.match(regex_link) || txt.match(regex_iframe);
	    
	    if (id_array){
		
		
		d.youtube_id =id_array[1];
		console.log("this is youtube video id= ", id_array[1]);
		d.is_youtube_video=true;
		d.html_need_refresh=true;
	    }
	    else{
		console.log("Failed to find youtube link");
	    }

	    
	},
	node_edit_end_handle: function(d){

	    var txt = this.end_edit();

	    console.log(txt);

	    d.editorActive=false;
	    if (txt) {      
		d.nodehtml = txt;
	    }
	    
	    var   node_type = guessNodeType(txt);
	    
	    if ((node_type=="ytvideo-link")||(node_type == "ytvideo-iframe")){

		this.youtube_handle(d,txt);
	
	    }
	    else{
		
		d.showHtml = true;

		d.html_need_refresh=true;
		d.is_youtube_video=false;
	    }

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
		.on("blur", function(d){
			that.node_edit_end_handle(d.original_data);
			
		    })
		.on("keypress", function(d){
			var e = d3.event;
			if (e.keyCode == 13){
			    if (e.stopPropagation)	e.stopPropagation();
			    e.preventDefault();
			    //  console.log("enter",d);
			    BurpController.node_edit_end_handle(d.original_data);			    
			}
		    });
	    this.input_object.value=original_data.nodehtml;
	},
	end_edit:function(){
	    //console.log("inner text",this.input_object.innerText);
	    // TODO Refactor next line
	    force.start();
	    to_return=this.input_object.value;
	    this.input_object.value="";
	    return to_return;
	}
    };
};