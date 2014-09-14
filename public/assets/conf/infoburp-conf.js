/**
 *  infoburp D3 Configuration
 *
 *  @namespace infoburp.conf
**/

var infoburp = infoburp || {};

infoburp.conf = {};

/**
 *  Generic (and global) graph settings
 *
 *  @namespace infoburp.conf.graphSettings
**/
var w = Math.max(0.7*Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
infoburp.conf.graphSettings = {
    width:               w,  // width of the graph UI display
    height:               h,  // height of the graph UI display
    nodeLimit:             6,  // Max nodes to display in UI
    circleRadius:          48,  // Radius of circles (nodes)
    linkDistance:         256,  // Distance between circles (nodes)
    charge:             -1024,  // node repel charge
    selectedClass: 'selected',   // css class for selected (clicked) nodes
};

infoburp.conf.core = {
    host: 'localhost'    // where the node.js server be at
};
