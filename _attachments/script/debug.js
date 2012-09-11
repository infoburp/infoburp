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

/* It is a stub function that only tries to guess if in editor is link to youtube video and if that
 * the case then it renders it via swfobject. Otherwise it's just writes it plain to run-node div
 * 
 */


   var valedit= document.getElementById("burp-edit").value;

    if (guessNodeType(valedit)=="ytvideo-link"){

	console.log("Yes this is a youtube-link",testIfYTLink(valedit)[1]);
//	render_youtube_video_to_div(document.getElementById("run-node"),testIfYTLink(valedit)[1],400,400);
	
    }else{
	document.getElementById("run-node").innerHTML = valedit;
    };


  
};