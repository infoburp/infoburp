COUCHDB=false;
DEBUG_DATASET=
	{
		nodes:[
    			{
				x:200,
				y:200,
				nodehtml:"infoburp.com",
				showHtml:true

			}],
    		links:[ ]
    
	};

function run_node(){

   var valedit= document.getElementById("burp-edit").value;

    if (guessNodeType(valedit)=="ytvideo-link"){

	console.log(testIfYTLink(valedit)[1]);
	render_youtube_video_to_div(document.getElementById("run-node"),testIfYTLink(valedit)[1],400,400);
	
    }else{
	document.getElementById("run-node").innerHTML = valedit;
    };


  
};