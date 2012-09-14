goog.provide('infoburp.Content.ContentTypeHandlersRegistry');
goog.provide('infoburp.Content.ContentTypeHandler');
goog.provide('infoburp.Content.HeuristicEngine');



infoburp.Content.HeuristicEngine=function(){
};

var heuristicEngine=new infoburp.Content.HeuristicEngine();

infoburp.Content.HeuristicEngine.prototype.testIfYTLink=function(txt){
    
    regex = /www\.youtube\.com\/watch\?v=(.{11})/;
    
    return txt.match(regex);
};

infoburp.Content.HeuristicEngine.prototype.testIfYTIframe=function(txt){
    regex=/<iframe.+http\:\/\/www\.youtube\.com\/embed\/(.{11}).+iframe>/;
    return txt.match(regex);
    };


infoburp.Content.HeuristicEngine.prototype.guessNodeType=function(inputText){


    var id_array = this.testIfYTLink(inputText);
    
    if (this.testIfYTLink(inputText)){
	
	return "ytvideo-link";

    }
    else{if (this.testIfYTIframe(inputText)){
	     
	     return "ytvideo-iframe";
	 }

	 else	return "simple";
    
    };


};
infoburp.Content.ContentTypeHandlersRegistry=function(){
  this.registry=[];  
};

infoburp.Content.ContentTypeHandlersRegistry.prototype.registerTypeHandler=function(typeHandler){
  
    this.registry.push(typeHandler);
  
};


// TODO consider consistent renaming render/wrapper summary primary doesn't seems to be a good choice.
infoburp.Content.ContentTypeHandlersRegistry.prototype.attachRender=function(d){

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
    
    var l = this.registry.length;
    
//    console.log("registered type handlers",registeredContentTypeHandlers,"data",d);
    for (var i = 0;i < l ;i++){

	if (this.registry[i].isThis(d.nodehtml)){
	    
//	    console.log("Wrapping node as",registeredContentTypeHandlers[i].contentType);

	    d.contentWrapper=this.registry[i].wrapContent(d.nodehtml);

	    break;
	};

    }
    
};

infoburp.Content.ContentTypeHandlersRegistry.prototype.defaultInit=function(){


    // Todo refactor. Maybe set up global singleton. And move registration to dedicated source file
    this.registerTypeHandler(new infoburp.Content.ContentTypeHandler("youtubecontent",
				    function youtubeclassifier (content){
					//	console.log("content from youtube classifier",content);
					if (heuristicEngine.testIfYTLink(content)||heuristicEngine.testIfYTIframe(content)){
					    return true;	
					    //            console.log("This is youtube video");					 
					}
					else{
					    return false;
					};
					
				    },
				    
				    youtubeSummaryRender,
				    
				    youtubePrimaryRender
				    
				   ));

    
    // Just simple handler for basic html it should be registered last as it classifier always returns true.
    this.registerTypeHandler(new infoburp.Content.ContentTypeHandler("htmlContent",
				    
				    function(content){
					return true;
				    },
				    
				    function(div,content){
					div.innerHTML=content;
				    },
				    function(div,content){
					div.innerHTML=content;
				    }));
    
    
    
};




infoburp.Content.ContentTypeHandler=function(typeName,typeClassifier,summaryRender,primaryRender){

	this.contentType=typeName;
	
	this.isThis=typeClassifier;
    
        this.summaryRender=summaryRender;

        this.primaryRender=primaryRender;

    

};


infoburp.Content.ContentTypeHandler.prototype.wrapContent=function(content_to_wrap){

// TODO refactor namespace dance

    var local_summaryRender=this.summaryRender;
    var local_primaryRender=this.primaryRender;
    var local_typeName= this.typeName;
    return {
	
	type:local_typeName,
	
	wrapped_content:content_to_wrap,
	
	summary:function (div){
		    
	    //		    console.log(summaryRender,this.typeName);
	    local_summaryRender(div,this.wrapped_content);
		},
	
	primary:function (div){
	    local_primaryRender(div,this.wrapped_content);
	}
		
	
    };  
    
};





YTH_THUMBNAIL_NUMBER=3;
YTH_THUMBNAIL_HEIGHT=90;
YTH_THUMBNAIL_WIDTH=120;


var contentTypeHandlersRegistry=new infoburp.Content.ContentTypeHandlersRegistry();


/*
function registerContentTypeHandler(typeName,typeClassifier,summaryRender,primaryRender){


contentTypeHandlersRegistry.registerTypeHandler(new ContentTypeHandler(typeName,typeClassifier,summaryRender,primaryRender));


/*
 * This function returns object that has collection of methods used for rendering nodes
 * 
 */
    /*
    registeredContentTypeHandlers.push({
	
	
	wrapContent:function(content_to_wrap){
	    
	    return {
		
		type:typeName,
		
		wrapped_content:content_to_wrap,
		
		summary:function (div){

//		    console.log(summaryRender,this.typeName);
		    summaryRender(div,this.wrapped_content);
		},
		
		primary:function (div){
		    primaryRender(div,this.wrapped_content);
		}
		
		
	    };
	    
	}
				
	
    
    });*/
  
  
//}


var youtubeLinkHandler= function(div,content,generate_link){

    var id_array = heuristicEngine.testIfYTLink(content) || heuristicEngine.testIfYTIframe(content);
    
    if (id_array){
	
	var img=document.createElement("img");

	img.height=YTH_THUMBNAIL_HEIGHT;
	img.width=YTH_THUMBNAIL_WIDTH;
	img.src="http://img.youtube.com/vi/"+id_array[1]+"/"+YTH_THUMBNAIL_NUMBER+".jpg";

	// Clearing 	
	div.innerHTML="";

	if (generate_link){

	    var anchor=document.createElement("a");
	    anchor.href="http://www.youtube.com/watch?v="+id_array[1];
	    anchor.target="blank";
	    anchor.appendChild(img);
	    div.appendChild(anchor);
	    
	}
	else{

	div.appendChild(img);
	}
    }
    else{
//	console.log("Failed to find youtube link");
    };
};


var youtubePrimaryRender= function(div,content){

    youtubeLinkHandler(div,content,true);

    
};

var youtubeSummaryRender= function(div,content){

    youtubeLinkHandler(div,content,false);

    
};





