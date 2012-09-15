function run_node(){

/* It is a stub function that only tries to guess if in editor is link to youtube video and if that
 * the case then it renders it via swfobject. Otherwise it's just writes it plain to run-node div
 * 
 */


   var valedit= myField.getCleanContents();

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
    
};