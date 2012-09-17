goog.provide('ib.GraphController');


ib.GraphController = function(vis) {

    this.svgVis = vis;

    this.snap = {
        x: null,
        y: null
    };

    this.temporalLinkArray = [];
    this.temporalNodeArray = [];

    this.draggingNow = false;

};



ib.GraphController.prototype.dragStartHandler = function(d) {

    this.addTemporalNode(d.x, d.y);
    this.addTemporalLink(d, this.temporalNodeArray[0]);
    this.draggingNow = true;
    this.refreshTemporalState();
};


ib.GraphController.prototype.addTemporalNode = function(x, y) {
    /*
     * This function adds one circle on x y
     */

    this.temporalNodeArray.push({
                                    x: x,
                                    y: y,
                                    showCircle: true
                                });


};


ib.GraphController.prototype.refreshTemporalState = function() {

    /*
     *  Refreshing view for temporary elements
     */


    // Creating circle that is denotes temporary node
    var temporalNodeSelection = this.svgVis.selectAll('circle.temporal_node')
        .data(this.temporalNodeArray);

    temporalNodeSelection.enter().insert('circle')
        .attr('class', 'temporal_node')
        .attr('r', TEMPORARY_NODE_CIRCLE_RADIUS)
        .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')'; });

    temporalNodeSelection.exit().remove();

    // Creating temporary link.
    var temporalLinkSelection = this.svgVis.selectAll('line.temporal_link')
        .data(this.temporalLinkArray);

    temporalLinkSelection.enter().insert('line', 'circle.temporal_node')
        .attr('class', 'temporal_link')
        .call(linkCoordinatesSet);

    temporalLinkSelection.exit().remove();

};


ib.GraphController.prototype.nodesDistances = function(x, y) {

    /*
     * This function calculates for all global_data.nodes objects distance to x,y and returns nearest node
     */

    var distanceArray = [];

    var that = this;

    global_data.nodes.forEach(function(current,num) {

                                  distanceArray.push({
                                                         node: current,
                                                         index: num,
                                                         distance: that.distanceToNode(x, y, current)
                                                     }
                                                    );


                              });



    distanceArray.sort(function(a,b) {

                           // We are sorting in descending order so nearest node comes first

                           return (a.distance - b.distance);

                       });

    return distanceArray;

};




ib.GraphController.prototype.distanceToTemporalNode = function(x, y) {

    return this.distanceToNode(x, y, this.temporalNodeArray[0]);
};




ib.GraphController.prototype.distanceToNode = function(x, y, nodeData) {

    X = x - nodeData.x;
    Y = y - nodeData.y;

    return Math.sqrt(X * X + Y * Y);

};




ib.GraphController.prototype.temporalTick = function(x,y) {

    // Updating position for temporal node circle and  link line
    if (this.temporalNodeArray[0]) {

        this.temporalNodeArray[0].x = x;
        this.temporalNodeArray[0].y = y;
        this.svgVis.selectAll('circle.temporal_node')
            .style('opacity', function(d) {
                       if (d.showCircle) {
                           return 1;
                       }
                       else
                       {
                           return 0;
                       }

                   })

            .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')'; });


        if (this.snap !== null) {


            this.temporalLinkArray[0].target = this.snap;

            this.temporalNodeArray[0].showCircle = false;

        }else {

            this.temporalLinkArray[0].target = this.temporalNodeArray[0];
            this.temporalNodeArray[0].showCircle = true;
        }

        this.svgVis.selectAll('line.temporal_link')
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });


    }
};




ib.GraphController.prototype.removeTemporalNodeAndLink = function() {
    // Dissapearing temporary circle
    this.svgVis.selectAll('circle.temporal_node')
        .transition()
        .duration(NODE_APPEARANCE_DURATION / 10)
        .style('opacity', 0);

    // Dissapearing and changing color temporary link

    this.svgVis.selectAll('line.temporal_link')
        .transition()
        .duration(NODE_APPEARANCE_DURATION / 2)
        .style('stroke-opacity', 0);


    // setTimeout work with global context, so using this workaround

    var that = this;

    setTimeout(function() {

                   that.temporalNodeArray = [];
                   that.temporalLinkArray = [];
                   that.snap = null;
                   that.draggingNow = false;
                           that.refreshTemporalState();

               },NODE_APPEARANCE_DURATION);



};




ib.GraphController.prototype.addTemporalLink = function(source,target) {

    // This function adds one line between source and target expecting source and target has x y fields

    this.temporalLinkArray.push({
                                    source: source,
                                    target: target
                                });

};






TEMPORARY_NODE_CIRCLE_RADIUS = 20;

ib.GraphController.prototype.addNewLink = function(sourceData) {

    // If there are selected nodes we get first one and make a link to it


    /*  && GraphContorller.snap.index is workaround for some race condition or something.
     *  TODO Debug it
     */

    if (this.snap && (!(this.snap.index === undefined))) {

        var target = this.snap;

        var nodesAreDifferent = sourceData.index !== target.index;
        var isLinkNotRedundant = this.linkNotRedundant(sourceData.index, target.index);

        /* Adding link if nodes are different , link is not duplicate and there is
         * node which is temporary link snapped to.
         */

        if (nodesAreDifferent && isLinkNotRedundant) {

            global_data.links.push({source: sourceData, target: target});

            target.selected = false;
        }
        else {
            global_data.nodes.forEach(function(d,i) {

                                          d.selected = false;});

            target.selected = !nodesAreDifferent;

        }

        return true;

    }
    else {

        return false;

    }


};

ib.GraphController.prototype.addNewInferiorNode = function(sourceData,inferiorContent) {

    var newNode = new nodetemplate({

                                       nodehtml: inferiorContent
                                   });

    newNode.x = X;
    newNode.y = Y;

    global_data.nodes.push(newNode);

    global_data.links.push({
                               source: sourceData,
                                    target: newNode
                           });



};


ib.GraphController.prototype.addNewNode = function(sourceData,X,Y) {

    if (this.distanceToTemporalNode(sourceData.x, sourceData.y) > NODERADIUS) {

        var newNode = new nodetemplate(sourceData);

        newNode.x = X;
        newNode.y = Y;

        global_data.nodes.push(newNode);

        global_data.links.push({
                                   source: sourceData,
                                   target: newNode
                               });

        return true;

    }
    else {

        return false;

    }
};


ib.GraphController.prototype.selectNearestNode = function(sourceData,sourceEvent) {

    //Calculating distances to nodes

    var nodesDistances = this.nodesDistances(sourceEvent.x, sourceEvent.y);

    // making all nodes green

    //    console.log("Deselecting all node from select nearest node");

    global_data.nodes.forEach(function(d) {
                                  d.selected = false;
                              }
                             );

    // making nearest node yellow if it insider radius of linking

    var nearestNode = nodesDistances[0];

    //    console.log(nodes_distances);


    var nodeIsNear = (nearestNode.distance < linkingradius);
    // var nodesAreDifferent=(nearest_node.node.index !== source_data.index);

    if (nodeIsNear) {

        nearestNode.node.selected = true;

        this.snap = nearestNode.node;

    }
    else {
        // Removing snapping to the node
        this.snap = null;

    }
};


ib.GraphController.prototype.linkNotRedundant = function(sourceIndex,targetIndex) {

    var testFunction = function(d) {

        // Checking if node we are trying to link is the same as source node.
        var sameSIndex = (d.source.index == sourceIndex);
        var sameTIndex = (d.target.index == targetIndex);

        // Checking if exist link that is backward to one we are trying to add
        var sameTSIndex = (d.target.index == sourceIndex);
        var sameSTIndex = (d.source.index == targetIndex);

        return sameSIndex && sameTIndex || sameSTIndex && sameTSIndex;

    };

    return !((global_data.links.filter(testFunction)).length > 0);
};

