var nameGraph = new Graph();
{
    var sitename = nameGraph.newNode({label: 'infoburp.com'});
    var what = nameGraph.newNode({label: 'what is infoburp'});
    var licensequestion = nameGraph.newNode({label: 'is it free'});
    var licenseanswer = nameGraph.newNode({label: 'yes, infoburp is free and open source software'});
    var infoburpis = nameGraph.newNode({label: 'infoburp is an ideas network'});
    var anodeis = nameGraph.newNode({label: 'this is a node, it contains an idea'});
    var alinkednode = nameGraph.newNode({label: 'you can see this node is linked to the original idea'});
    var alpha = nameGraph.newNode({label: 'you cannot add ideas yet, I am working on it'});
    var future = nameGraph.newNode({label: 'once you can add ideas we will be able to share them'});
     

    nameGraph.newEdge(sitename, what, {color: '#7DBE3C'});
    nameGraph.newEdge(what,licensequestion, {color: '#7DBE3C'});
    nameGraph.newEdge(what,infoburpis, {color: '#7DBE3C'});
    nameGraph.newEdge(infoburpis,anodeis, {color: '#7DBE3C'});
    nameGraph.newEdge(anodeis,alinkednode, {color: '#7DBE3C'});
    nameGraph.newEdge(what,alpha, {color: '#7DBE3C'});
    nameGraph.newEdge(anodeis,future, {color: '#7DBE3C'});
    nameGraph.newEdge(licensequestion,licenseanswer, {color: '#7DBE3C'});
}