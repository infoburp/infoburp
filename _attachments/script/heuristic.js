function testIfYTLink(txt){
    
    regex = /http\:\/\/www\.youtube\.com\/watch\?v=(.{11})/;
    
    return txt.match(regex);
    }

function testIfYTIframe(txt){
    regex=/<iframe.+http\:\/\/www\.youtube\.com\/embed\/(.{11}).+iframe>/;
    return txt.match(regex);
    }


function guessNodeType(inputText){


    var id_array = testIfYTLink(inputText);
    
    if (testIfYTLink(inputText)){
	
	return "ytvideo-link";

    }
    else{if (testIfYTIframe(inputText)){
	     
	     return "ytvideo-iframe";
	 }

	 else	return "simple";
    
    };


};
