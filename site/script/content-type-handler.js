goog.provide('ib.ContentTypeHandler');
goog.provide('ib.ContentTypeHandlersRegistry');
goog.provide('ib.HeuristicEngine');



ib.HeuristicEngine = function() {
};

var heuristicEngine = new ib.HeuristicEngine();

ib.HeuristicEngine.prototype.testIfYTLink = function(txt) {

    var regex = /www\.youtube\.com\/watch\?v=(.{11})/;

    return txt.match(regex);
};

ib.HeuristicEngine.prototype.testIfYTIframe = function(txt) {
    var regex = /<iframe.+http\:\/\/www\.youtube\.com\/embed\/(.{11}).+iframe>/;
    return txt.match(regex);
    };


ib.HeuristicEngine.prototype.guessNodeType = function(inputText) {


    var id_array = this.testIfYTLink(inputText);

    if (this.testIfYTLink(inputText)) {

        return 'ytvideo-link';

    }
    else { if (this.testIfYTIframe(inputText)) {

             return 'ytvideo-iframe';
         }

         else return 'simple';

    }


};

ib.HeuristicEngine.prototype.getHyperLinkList = function(content) {

    var regex = /<a[^>]+href="(.[^">]+)"[^>]*>/;

    console.log(content.match(regex));

    var result = content.match(regex);

    return (result) ? result[1] : null;




};



ib.ContentTypeHandlersRegistry = function() {
  this.registry = [];
};

ib.ContentTypeHandlersRegistry.prototype.registerTypeHandler = function(typeHandler) {

    this.registry.push(typeHandler);

};


// TODO consider consistent renaming render/wrapper summary primary doesn't seems to be a good choice.
ib.ContentTypeHandlersRegistry.prototype.attachRender = function(d) {

   /*
    * This function tries to guess type of d.nodehtml content and then attach relevant wrapper
    * object to d.
    * Wrapper usage :
    *
    * Render 'summary' content to div
    * d.contentWrapper.summary(div)
    *
    * Render 'primary' content to div
    * d.contentWrapper.primary(div)
    */

    var l = this.registry.length;

//    console.log("registered type handlers",registeredContentTypeHandlers,"data",d);
    for (var i = 0; i < l; i++) {

        if (this.registry[i].isThis(d.nodehtml)) {

            console.log('Wrapping node as', this.registry[i].contentType, d.nodehtml, d);

            d.contentWrapper = this.registry[i].wrapContent(d.nodehtml);

            if (this.registry[i].inferiorNodesRender) {
                d.inferiorNodeRender = this.registry[i].inferiorNodesRender();
            }

            break;
        }

    }

};

ib.ContentTypeHandlersRegistry.prototype.defaultInit = function() {


    // Todo refactor. Maybe set up global singleton. And move registration to dedicated source file
    this.registerTypeHandler(new ib.ContentTypeHandler('youtubecontent',
                                                                     function youtubeclassifier(content) {
                                                                         //      console.log("content from youtube classifier",content);
                                                                         if (heuristicEngine.testIfYTLink(content) || heuristicEngine.testIfYTIframe(content)) {
                                                                             return true;
                                                                             //            console.log("This is youtube video");
                                                                         }
                                                                         else {
                                                                             return false;
                                                                         }

                                                                     },

                                                                     youtubeSummaryRender,

                                                                     youtubePrimaryRender

                                                                    ));


    this.registerTypeHandler(new ib.ContentTypeHandler('hyperlink',

                                                                     function hyperlinkClassifier(content) {
                                                                        return (heuristicEngine.getHyperLinkList(content)) ? true : false;
                                                                     },
                                                                     function(div, content) {
                                                                         div.innerHTML = content;
                                                                     },
                                                                     function(div, content) {
                                                                         div.innerHTML = content;
                                                                     },
                                                                     function getInferiorHyperLinkRender() {

                                                                         return function inferiorHyperLinkRender(d) {

                                                                             graphInterface.graphController.addNewInferiorNode(d, heuristicEngine.getHyperLinkList(d.nodehtml));};
                                                                     }


                           ));


    // Just simple handler for basic html it should be registered last as it classifier always returns true.
    this.registerTypeHandler(new ib.ContentTypeHandler('htmlContent',

                                    function(content) {
                                        return true;
                                    },

                                    function(div, content) {
                                        div.innerHTML = content;
                                    },
                                    function(div, content) {
                                        div.innerHTML = content;
                                    }));



};




ib.ContentTypeHandler = function(typeName, typeClassifier, summaryRender, primaryRender, inferiorNodesRender) {

        this.contentType = typeName;

        this.isThis = typeClassifier;

        this.summaryRender = summaryRender;

        this.primaryRender = primaryRender;

        this.inferiorNodesRender = inferiorNodesRender;

};


ib.ContentTypeHandler.prototype.wrapContent = function(content_to_wrap) {

// TODO refactor namespace dance

    var local_summaryRender = this.summaryRender;
    var local_primaryRender = this.primaryRender;
    var local_typeName = this.typeName;
    return {

        type: local_typeName,

        wrapped_content: content_to_wrap,

        summary: function(div) {

            //              console.log(summaryRender,this.typeName);
            local_summaryRender(div, this.wrapped_content);
                },

        primary: function(div) {
            local_primaryRender(div, this.wrapped_content);
        }


    };

};





YTH_THUMBNAIL_NUMBER = 3;
YTH_THUMBNAIL_HEIGHT = 90;
YTH_THUMBNAIL_WIDTH = 120;


var contentTypeHandlersRegistry = new ib.ContentTypeHandlersRegistry();


var youtubeLinkHandler = function(div, content, generate_link) {

    var id_array = heuristicEngine.testIfYTLink(content) || heuristicEngine.testIfYTIframe(content);

    if (id_array) {

        var img = document.createElement('img');

        img.height = YTH_THUMBNAIL_HEIGHT;
        img.width = YTH_THUMBNAIL_WIDTH;
        img.src = 'http://img.youtube.com/vi/' + id_array[1] + '/' + YTH_THUMBNAIL_NUMBER + '.jpg';

        // Clearing
        div.innerHTML = '';

        if (generate_link) {

            var anchor = document.createElement('a');
            anchor.href = 'http://www.youtube.com/watch?v=' + id_array[1];
            anchor.target = 'blank';
            anchor.appendChild(img);
            div.appendChild(anchor);

        }
        else {

        div.appendChild(img);
        }
    }
    else {
//      console.log("Failed to find youtube link");
    }
};


var youtubePrimaryRender = function(div, content) {

    youtubeLinkHandler(div, content, true);


};

var youtubeSummaryRender = function(div, content) {

    youtubeLinkHandler(div, content, false);


};

