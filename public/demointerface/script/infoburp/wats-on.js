//wats-on.js

//this script decide's wats-on the screen, and what is not on the screen.

//toolbox:
/*
	//resize iframes
         function resizeIframe(newHeight) {
              $("#frameId").height(newHeight);
          }
	//show iframes
	$("#contentIframe").show();
	//hide iframes
	$("#contentIframe").hide();
*/
    function iframeLoaded()
    {
        var iFrameID = document.getElementById('idIframe');

        if(iFrameID)
        {
            // here you can meke the height, I delete it first, then I make it again
            iFrameID.height = "";
            iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + "px";
        }   
    }  
