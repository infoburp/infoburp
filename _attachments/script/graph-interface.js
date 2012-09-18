/*
 * This file provides GraphInterface
 *
 * Point in it's creating is to confine d3.js library usage to this object.
 */

goog.provide('ib.GraphInterface');

goog.require('ib.GraphController');


// Two helper functions refactor them consider moving to GraphController

function linkCoordinatesSet(linkSelection) {

    linkSelection.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
}

function colorCircles(circlesSelection) {

    circlesSelection.attr('class', function(d) {
                              if (d.selectedAs==='yellow'){
                                  
                                  return 'node selected_node_yellow';
                                      
                              } else{
                                  if (d.selectedAs==='red'){
                                      return 'node selected_node_red';
                                  }
                                  else
                                  {
                                      return 'node unselected_node';
                                  }
                                  
                              };
                              
 
                          });
    
}




ib.GraphInterface = function(divObject, dataContainer) {

this.dataContainer = dataContainer;

this.renderDiv = divObject;

this.vis = null;

this.force = null;

this.nodedrag = null;

this.graphController = null;


};



ib.GraphInterface.prototype.initGraph = function() {

    var localGraphInterface = this;






    this.vis = d3.select(this.renderDiv).append('svg')
        .on('click', function(e) {

                if (!(d3.event.target.className == 'nodehtml')) {

                    localGraphInterface.flushState();

            }})
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('pointer-events', 'all')
        .call(d3.behavior.zoom().on('zoom', graphInterface.redrawClosure()))
        .append('svg:g');


    this.graphController = new ib.GraphController(this.vis);
    var localGraphController = this.graphController;

    var empty_array = [];

    for (var i = 0; i < unusedlinks; i++) {
        empty_array.push({
                             source: { x: 0, y: 0 },
                             target: { x: 0, y: 0 }
                         });
    }

    this.vis.selectAll('line.unused_link')
        .data(empty_array)
        .enter()
        .insert('line')
        .attr('class', 'link unused_link');

    // Standard force layout see https://github.com/mbostock/d3/wiki/Force-Layout for documentation
    this.force = d3.layout.force()
        .linkStrength(linkstrength)
        .gravity(gravity)
        .charge(charge)
        .nodes(this.dataContainer.nodes)
        .links(this.dataContainer.links);

    var localForce = this.force;
    var localTick = this.tickClosure();
    var localData = this.dataContainer;



    var dragstart = function(d, i) {

        localGraphInterface.flushState();
        localForce.stop(); // stops the force auto positioning before you start dragging

        //    console.log("dragstart",d);
        d.selected = true;
        //    console.log("dragstart end",d,d.selected);
        localGraphController.dragStartHandler(d);
        //    console.log("dragstart end",d);

    };


    var dragmove = function dragmove(d, i) {

        localGraphController.temporalTick(d3.event.x, d3.event.y);

        // Selecting node nearest to mouse event
        localGraphController.selectNearestNode(d, d3.event);

        //Making force simulation
        localTick();
    };



    var dragend = function dragend(d, i) {


        console.log('Dragend', d);

        // Saving last temporal node coordinates before removing
        var X = localGraphController.temporalNodeArray[0].x;
        var Y = localGraphController.temporalNodeArray[0].y;


        // Removing temporal link and node
        localGraphController.removeTemporalNodeAndLink();


        // Adding new link if necessary (function checks if source and target are distinct).
        //TODO refactor
        if (localGraphController.addNewLink(d)) {


        }
        else {

            /* And if there where no internode links added then we adding new
             * node only if temporal node is far from source
             */

            //TODO Refactor.
            if (localGraphController.addNewNode(d, X, Y)) {

            }
            else {

                
                globalHistory.newActiveNode(d);

                
            }
        }


        if (d.selected) {

            infoBurpController.startEdit(d);
        }

        // Refreshing svg after modifying data
        localGraphInterface.restart();

        localGraphInterface.force.start();

    };

    this.node_drag = d3.behavior.drag()
        .on('dragstart', dragstart)
        .on('drag', dragmove)
        .on('dragend', dragend);


    this.force.on('tick', this.tickClosure());

    this.force.start();

    this.restart();


};

ib.GraphInterface.prototype.flushState = function() {

    this.dataContainer.nodes.forEach(function(d,i) {
                                d.selected = false;
                            });

    // Making burp editor inactive; TODO consider Lorem Ipsuming some default text.
    myField.setHtml('');
    (!myField.isUneditable()) ? myField.makeUneditable() : console.log('Trying to make editable already editable field');

};


ib.GraphInterface.prototype.restart = function() {


    // Normal links which would reuse pool of unused_links
    this.vis.selectAll('line.link')
        .data(this.dataContainer.links)
        .enter().insert('line')
        .attr('class', 'link')
        .call(linkCoordinatesSet);




    var nodeSelection = this.vis.selectAll('g.node')
        .data(this.dataContainer.nodes)
        .on('click', function(e) {

                /* Stopping propagation of click event so it wouldn't messs with
                 * svg onclick node deselecting
                 */
                d3.event.stopPropagation();
            }

           );


    var nodeEnter = nodeSelection.enter().append('svg:g')
        .attr('class', 'node');


    var circles = nodeEnter.append('svg:circle')
        .call(colorCircles)
        .attr('r', NODEINITRADIUS)
        .transition()
        .duration(NODE_APPEARANCE_DURATION)
        .attr('r', NODERADIUS);

    // Applying modified drag behaviour to nodes
    nodeEnter.call(this.node_drag);

    var new_nodes = nodeEnter.append('foreignObject')
        .attr('class', 'node')
        .attr('height', FOREIGN_OBJECT_SIDE)
        .attr('width', FOREIGN_OBJECT_SIDE)
        .attr('x', FOREIGN_OBJECT_SHIFT) //so foreign object is inside circle
        .attr('y', FOREIGN_OBJECT_SHIFT);

    // Deleting excessive nodes.
    nodeSelection.exit().remove();


    var nodehtmls = new_nodes.append('xhtml:div')
        .attr('class', 'nodehtml')
        .each(function(d,i) {

                  // Initializing render for data
                  infoburpContentTypeHandlerRegistry.attachRender(d);

                  // Rendering data summary to this div
                  d.contentWrapper.summary(this);}
             )
        .style('opacity', 0)
        .transition()
        .duration(NODE_APPEARANCE_DURATION)
        .style('opacity', 1);

};


ib.GraphInterface.prototype.redrawClosure = function() {

    //var localVis=graph.vis;

    //console.log(localVis);

    return function redraw() {
        //      console.log("here we go", d3.event.translate, d3.event.scale,localVis);

        // TODO Fix this dirty hack. Should find a way to refer to this.vis
        graphInterface.vis.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
    };
};


ib.GraphInterface.prototype.tickClosure = function() {

    local_vis = this.vis;

    return function tick_fu() {

        //console.log(global_data.nodes[0].x, 'before');

        local_vis.selectAll('line.link')
            .call(linkCoordinatesSet);

        local_vis.selectAll('line.temporal_link')
            .call(linkCoordinatesSet);

        // Moving all g groups according to data
        local_vis.selectAll('g.node')
            .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });


        local_vis.selectAll('.nodehtml')
            .filter(function(d) {
                        // we are taking only thoose nodes that have html edited
                        return d.html_need_refresh;
                    })
            .each(function(d,i) {

                      d.contentWrapper.summary(this);
                      //marking that we refreshed this html
                      d.html_need_refresh = false;

                      if (d.inferiorNodeRender) {

                          d.inferiorNodeRender(d);

                      }

                      console.log('global data before restart', global_data, global_data.nodes[0].x);
                      graphInterface.restart();
                  });

        local_vis.selectAll('circle.node').call(colorCircles);

      //  console.log(global_data.nodes[0].x, 'after');
 };
};
