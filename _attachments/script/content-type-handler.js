YTH_THUMBNAIL_NUMBER=3;
YTH_THUMBNAIL_HEIGHT=90;
YTH_THUMBNAIL_WIDTH=120;


var registeredContentTypeHandlers=[];

function registerContentTypeHandler(typeName,typeClassifier,summaryRender,primaryRender){
/*
 * This function returns object that has collection of methods used for rendering nodes
 * 
 */
    
    registeredContentTypeHandlers.push({
	
	contentType:typeName,
	
	isThis:typeClassifier,
	
	wrapContent:function(content_to_wrap){
	    
	    return {
		
		type:typeName,
		
		wrapped_content:content_to_wrap,
		
		summary:function (div){

		    console.log(summaryRender,this.typeName);
		    summaryRender(div,this.wrapped_content);
		},
		
		primary:function (div){
		    primaryRender(div,this.wrapped_content);
		}
		
		
	    };
	    
	}
				
	
    
    });
    
}




var youtubeLinkHandler= function(div,content){

    var id_array = testIfYTLink(content) || testIfYTIframe(content);
    
    if (id_array){
	
	var img=document.createElement("img");

	img.height=YTH_THUMBNAIL_HEIGHT;
	img.width=YTH_THUMBNAIL_WIDTH;
	img.src="http://img.youtube.com/vi/"+id_array[1]+"/"+YTH_THUMBNAIL_NUMBER+".jpg";

	// Clearing 	
	div.innerHTML="";

	div.appendChild(img);
    }
    else{
	console.log("Failed to find youtube link");
    }
    
    

;

};


registerContentTypeHandler("youtubecontent",
    function youtubeclassifier (content){
	console.log("content from youtube classifier",content);
	if (testIfYTLink(content)||testIfYTIframe(content)){
	    return true;	
            console.log("This is youtube video");					 
	}
	else{
	    return false;
	};
	
    },
    
    youtubeLinkHandler,
    
    youtubeLinkHandler
);


// Just simple handler for basic html it should be registered last as it classifier always returns true.
registerContentTypeHandler("htmlContent",
		      
		      function(content){
			  return true;
		      },
		      
		      function(div,content){
			  div.innerHTML=content;
		      },
		      function(div,content){
			  div.innerHTML=content;
		      });


// TODO consider consistent renaming render/wrapper summary primary doesn't seems to be a good choice.
function attachRender(d){

   /*
    * This function tries to guess type of d.nodehtml content and then attach relevant wrapper
    * object to d.
    * 
    * Wrapper usage :
    * 
    * Render 'summary' content to div
    * 
    * d.contentWrapper.summary(div)
    * 
    * Render 'primary' content to div
    * d.contentWrapper.primary(div)
    */
    
    var l = registeredContentTypeHandlers.length;
    
    console.log("registered type handlers",registeredContentTypeHandlers,"data",d);
    for (var i = 0;i < l ;i++){

	if (registeredContentTypeHandlers[i].isThis(d.nodehtml)){
	    
	    console.log("Wrapping node as",registeredContentTypeHandlers[i].contentType);

	    d.contentWrapper=registeredContentTypeHandlers[i].wrapContent(d.nodehtml);

	    break;
	};

    }
    
};