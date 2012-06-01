function new3DSpace(element, graph, width, height) {
    element = '#' + element;
    
    var e = $(element);
    
    var x3delement = element + '_X3D';
    
    var t = '';    
    t += '<x3d id="' + x3delement + '" style="position:relative; line-height:0px; padding:0; display:block; width:' + width + '; height:' + height + '; border-color:#666;">';
    t += '<scene>';
    t += '  <param name="PrimitiveQuality" value="Low"></param>';
    t += '  <viewpoint position="0 0 11"></viewpoint>';
    t += '  <background skyColor="0.5 0.5 0.5"></background>';
    t += '  <transform id="' + element + '_root" translation="0 0 0"></transform>';
    t += '</scene>';

    //TODO only create a full-screen button if indicated by a parameter to this function
    
    t += '<ul class="spacetools">';
    t += '  <li><button onclick="toggle_size(document.getElementById(\'';
        t+= x3delement;
        t+= '\'), this);"><img src="images/fullscreen.png"/></button></li>';
    t += '</ul>';
    
    t += '</x3d>';
    
    e.html(t);

    var layout = graphLayout(element, graph);

    return e;
}

function new2DSpace(element, graph, width, height) {
    var e = $('#' + element);
    var canvasElement = element + '_canvas';
    
    var t = '';
    t += '<canvas id="' + canvasElement + '" width="' + width + '" height="' + height + '"></canvas>'; 
    e.html(t);

    jQuery('#' + canvasElement).springy({ 'graph': nameGraph });  

    return e;
}



var x3dZoomed = Array();

function toggle_size(x3d_element, button) {            

    if (x3dZoomed[x3d_element] == undefined) {
        x3dZoomed[x3d_element] = false;
    }

    if (x3dZoomed[x3d_element]) {
            button.style.backgroundColor = "#202021";
            x3d_element.style.borderWidth  = "1px"
            new_width = "50%";
            x3dZoomed[x3d_element] = false;
    } else {
            button.style.backgroundColor = "#c23621";
            x3d_element.style.borderWidth  = "0px"
            new_width = "100%";
            x3dZoomed[x3d_element] = true;
    }

    x3d_element.style.width  = new_width
    x3d_element.style.height = new_width
    return true;
}


Graph.prototype.loadDataBank = function(rdfDataBank) {
    var nodes = new Array();

    var tr = rdfDataBank.triples();
    for (i=0; i < tr.length; i++) {

        var property = tr[i].property.value;
        var subject = tr[i].subject.value;
        var object = tr[i].object.value;

        //alert(subject + ' ' + property + ' ' + object);

        var subjectNode = nodes[subject];
        if (subjectNode == undefined) {
            subjectNode = this.newNode({label: subject});
            nodes[subject] = subjectNode;
        }
        var objectNode = nodes[object];
        if (objectNode == undefined) {
            objectNode = this.newNode({label: object});
            nodes[object] = objectNode;
        }

        this.newEdge(subjectNode, objectNode, {label:property, color: '#00A0B0'});
   }
   
   return this;
}

function graphLayout(space, graph) {
   return $(space).springyx3dom({ 'graph': graph });
}

/**
Copyright (c) 2010 Dennis Hotson

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/
function addText(n, text, x, y ,z) {
    var t = document.createElement('Transform');
    {
        t.setAttribute("translation", x + " " + y + " " + z );

        var s = document.createElement('Shape');
        t.appendChild(s);

        {
            var a = document.createElement('Appearance');
            s.appendChild(a);
            
            var m = document.createElement('Material');
            m.setAttribute('ambientIntensity', '0.0933');
            m.setAttribute('diffuseColor', '0.1 0.1 0.1');
            m.setAttribute('shininess', '0.25');
            m.setAttribute('specularColor', '0.46 0.46 0.46');
            a.appendChild(m);
            //<material ambientIntensity='0.0933' diffuseColor='0.32 0.54 0.26' shininess='0.51' specularColor='0.46 0.46 0.46'></material>
            
        }
        var txt = document.createElement('Text');
        txt.setAttribute('string', text);
        txt.setAttribute('solid', 'false');
        {
            var fs = document.createElement('fontstyle');
            fs.setAttribute('family', "ARIAL");
            fs.setAttribute('style', "BOLD");
            fs.setAttribute('size', "32");
            txt.appendChild(fs);
        }
        s.appendChild(txt);            

        /*    <shape>
                <appearance>
                  <material ambientIntensity='0.0933' diffuseColor='0.32 0.54 0.26' shininess='0.51' specularColor='0.46 0.46 0.46'></material>
                </appearance>
                <text string='Mono bolditalic 32px' solid='false'>
                    <fontstyle family="TYPEWRITER" style="BOLDITALIC" size="32"></fontstyle>
                </text>
              </shape>*/

        var textlength = text.length * 1.0;
        if (textlength > 0) {
            var sx = 4.0/textlength;
            var sy = 4.0/textlength;
            t.setAttribute("scale", sx + " " + sy + " 1.0" );
        }
    }

    n.appendChild(t);

    return t;

}


function nodeClicked(nodeId) {
    //alert('node clicked: ' + nodeId);
}


function parseFromString(xml){
  var doc;
  try {
    doc = new ActiveXObject("Microsoft.XMLDOM");
    doc.async = "false";
    doc.loadXML(xml);
  } catch(e) {
    var parser = new DOMParser();
    doc = parser.parseFromString(xml, 'text/xml');
  }
  return doc;
};

function loadRDFXML(e) {
    var doc = parseFromString($(e).html());
    var databank = $.rdf.databank();
    databank.load(doc);
    return databank;            
}



var HALFPI = 3.14159 / 2.0;

(function() {

jQuery.fn.springyx3dom = function(params) {
    var graph = params.graph;
    
    var element = this;
    var elementName = '#' + element.attr('id');
    
    if ((!graph) || (!element)) {
        return null;
    }
    
    var stiffness = params.stiffness || 400.0;
    var repulsion = params.repulsion || 1600.0;
    var damping = params.damping || 0.5;

    var layout = new SLayout.ForceDirected(graph, stiffness, repulsion, damping);

    var radius = 4;
    
    // calculate bounding box of graph layout.. with ease-in
    var currentBB = layout.getBoundingBox();
    var targetBB = {bottomleft: new Vector(-radius/2.0, -radius/2.0), topright: new Vector(radius/2.0, radius/2.0)};
    
    var vertexToShape = new Array();
    var edgeToShape = new Array();

    // auto adjusting bounding box
    setInterval(function(){
            targetBB = layout.getBoundingBox();
            // current gets 20% closer to target every iteration
            currentBB = {
                    bottomleft: currentBB.bottomleft.add( targetBB.bottomleft.subtract(currentBB.bottomleft)
                            .divide(10)),
                    topright: currentBB.topright.add( targetBB.topright.subtract(currentBB.topright)
                            .divide(10))
            };
    }, 50);

    var tp = new Vector();
    
    // convert to/from screen coordinates
    toScreen = function(x, y) {
            tp.x = x;
            tp.y = y;
            
            var size = currentBB.topright.subtract(currentBB.bottomleft);
            var sx = tp.subtract(currentBB.bottomleft).divide(size.x).x * 100; //canvas.width;
            var sy = tp.subtract(currentBB.bottomleft).divide(size.y).y * 100; //canvas.height;
            
            sx = sx * 0.2 - (radius*2);
            sy = sy * 0.2 - (radius*2);

            return new Vector(sx, sy);
    };

    fromScreen = function(s) {
            var size = currentBB.topright.subtract(currentBB.bottomleft);
            var px = (s.x / 111 /* canvas.width */) * size.x + currentBB.bottomleft.x;
            var py = (s.y / 111 /* canvas.height */) * size.y + currentBB.bottomleft.y;
            return new Vector(px, py);
    };

    // half-assed drag and drop
    //var selected = null;
    //var nearest = null;
    //var dragged = null;

//    jQuery(canvas).mousedown(function(e){
//            jQuery('.actions').hide();
//
//            var pos = jQuery(this).offset();
//            var p = fromScreen({x: e.pageX - pos.left, y: e.pageY - pos.top});
//            selected = nearest = dragged = layout.nearest(p);
//
//            if (selected.node !== null)
//            {
//                    dragged.point.m = 10000.0;
//            }
//
//            renderer.start();
//    });
//
//    jQuery(canvas).mousemove(function(e){
//            var pos = jQuery(this).offset();
//            var p = fromScreen({x: e.pageX - pos.left, y: e.pageY - pos.top});
//            nearest = layout.nearest(p);
//
//            if (dragged !== null && dragged.node !== null)
//            {
//                    dragged.point.p.x = p.x;
//                    dragged.point.p.y = p.y;
//            }
//
//            renderer.start();
//    });
//
//    jQuery(window).bind('mouseup',function(e){
//            dragged = null;
//    });
//
//    Node.prototype.getWidth = function() {
//            ctx.save();
//            var text = typeof(this.data.label) !== 'undefined' ? this.data.label : this.id;
//            ctx.font = "16px Verdana, sans-serif";
//            var width = ctx.measureText(text).width + 10;
//            ctx.restore();
//            return width;
//    };
//
//    Node.prototype.getHeight = function() {
//            return 20;
//    };
    var drawn = new Array();

    var renderer = new Renderer(1, layout,
            function clear()
            {
                    //ctx.clearRect(0,0,canvas.width,canvas.height);
                    drawn = new Array();
            },
            
            function drawEdge(edge, p1, p2)
            {
                //alert('adding edge: ', edge);
                
                    var x1 = toScreen(p1.x, p1.y).x;
                    var y1 = toScreen(p1.x, p1.y).y;
                    var x2 = toScreen(p2.x, p2.y).x;
                    var y2 = toScreen(p2.x, p2.y).y;

                    var direction = new Vector(x2-x1, y2-y1);
                    var normal = direction.normal().normalise();

                    var from = graph.getEdges(edge.source, edge.target);
                    var to = graph.getEdges(edge.target, edge.source);
                    
                    //alert('drawing edge: ' + edge + ' ' + edge.source.data.label + ' ' + edge.target.data.label);
                    
                    var updateNode = function(node, x, y) {     
                        var nid = node.id;
                        var label = node.data.label;
                        var tid = elementName + '.' + nid + '.nodeTransform';
                        
                        if (vertexToShape[label] == undefined) {
                            //alert('adding node: ' + label + " " + vertexToShape.length);
                            vertexToShape[label] = true;


                            s0 = 1.5; //Math.random() + 0.5;
                            s1 = 1.0; //Math.random() + 0.5;
                            s2 = 0.2; //Math.random() + 0.5;

                            var t = document.createElement('Transform');
                            t.id = tid;
                            t.setAttribute("scale", s0 + " " + s1 + " " + s2 );
                            
                            var s = document.createElement('Shape');
                            t.appendChild(s);
                            
                            var b = document.createElement('Box');
                            s.appendChild(b);
                            
                            var ot = document.getElementById(elementName + '_root');
                            ot.appendChild(t);
                            
                            var textNode = addText(t, label, 0, 0, 2);
                            
                            
                            var eventString = 'nodeClicked(\"' + label + "\")";
                            b.setAttribute('onclick', eventString );
                            textNode.setAttribute('onclick', eventString );
                            

                        }
                        
                        var tt = document.getElementById(tid);
                        tt.setAttribute("translation", x + " " + y + " 0");
                        
                    };
                    
                    if (drawn[edge.source.data.label] != true) {
                        updateNode(edge.source, x1, y1);
                        drawn[edge.source.data.label] = true;
                    }
                    if (drawn[edge.target.data.label] != true) {
                        updateNode(edge.target, x2, y2);
                        drawn[edge.target.data.label] = true;
                    }

                    var total = from.length + to.length;

                    var n = 0;
                    for (var i=0; i<from.length; i++)
                    {
                            if (from[i].id === edge.id)
                            {
                                    n = i;
                            }
                    }
//
                    var spacing = 6.0;
//
//                    // Figure out how far off centre the line should be drawn
                      var offset = normal.multiply(-((total - 1) * spacing)/2.0 + (n * spacing)).multiply(0.2);
//
                      var s1 = toScreen(p1.x, p1.y).add(offset);
                      var s2 = toScreen(p2.x, p2.y).add(offset);
//  
//                    //var boxWidth = edge.target.getWidth();
//                    //var boxHeight = edge.target.getHeight();
//                    var boxWidth = 100;
//                    var boxHeight = 100;
//
//                    var intersection = intersect_line_box(s1, s2, {x: x2-boxWidth/2.0, y: y2-boxHeight/2.0}, boxWidth, boxHeight);
//
//                    if (!intersection) {
//                            intersection = s2;
//                    }
//
//
                      var stroke = typeof(edge.data.color) !== 'undefined' ? edge.data.color : '#777';
//
//                    var arrowWidth;
//                    var arrowLength;
//
                     var weight = typeof(edge.data.weight) !== 'undefined' ? edge.data.weight : 1.0;
//
//                    ctx.lineWidth = Math.max(weight *  2, 0.1);
//                    arrowWidth = 1 + ctx.lineWidth;
//                    arrowLength = 8;
//
                    var directional = typeof(edge.data.directional) !== 'undefined' ? edge.data.directional : true;
//
//                    // line

                    var eid = elementName + '.' + edge.id + '.edgeTransform';
                    
                    var edgeLabel = edge.source.id + '..' + edge.target.id;
                    var lineLength = Math.sqrt(s2.subtract(s1).magnitude());
                    var sx = 1.0; //width
                    var sy = lineLength; //length
                    var sz = 0.2; //depth
                    
                    x = (s1.x + s2.x) / 2.0;
                    y = (s1.y + s2.y) / 2.0;
                    
                    if (edgeToShape[edgeLabel] == undefined) {
                        
                        /**
                         * 	<Transform DEF="coneTrafo" translation="-4.5 0 0"> 
                                    <Shape DEF="coneShape"> 
                                            <Appearance DEF="coneApp"> 
                                                    <Material diffuseColor="0 1 0" specularColor=".5 .5 .5" /> 
                                            </Appearance> 
                                            <Cone DEF="cone" /> 
                                    </Shape> 
                            </Transform> 
                         */
                            
                        var t = document.createElement('Transform');
                        t.id = eid;

                        var s = document.createElement('Shape');
                        t.appendChild(s);

                        {
                            var a = document.createElement('Appearance');
                            var m = document.createElement('Material');
                            m.setAttribute("diffuseColor", stroke);

                            a.appendChild(m);
                            s.appendChild(a);
                        }
                        
                        var b = document.createElement('Cone');
                        s.appendChild(b);

                        var ot = document.getElementById(elementName + '_root');
                        ot.appendChild(t);                        
                        
                        if (edge.data.label != undefined) {
                            //add text
                            var ll = edge.data.label.length * 1.0;
                            var textNode = addText(t, edge.data.label, 0, 0, 2);
                            textNode.setAttribute('rotation', "0 0 1 " + HALFPI);

                            //var nsx = (1.0 / (sy*ll/18.0));
                            //var nsy = (1.0 / (ll/18.0));
                            var nsx = 0.5 / sy;
                            var nsy = 0.5;
                            textNode.setAttribute('scale', nsx + " " + nsy + " 1");
                        }
                        
                        edgeToShape[edgeLabel] = true;                        
                    }
                    
                    
                    var theta = Math.atan2((s2.y - s1.y), (s2.x - s1.x)) + HALFPI;
                    theta += HALFPI *2.0;
                    
                    var lt = document.getElementById(eid);
                    if (lt != undefined) {
                        lt.setAttribute("scale", sx + " " + sy + " " + sz );
                        lt.setAttribute("translation", x + " " + y + " 0");
                        lt.setAttribute("rotation", "0 0 1 " + theta);
                    }
            },
            function drawNode(node, p)
            {

            }
    );

    renderer.start();


    // helpers for figuring out where to draw arrows
    function intersect_line_line(p1, p2, p3, p4)
    {
            var denom = ((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));

            // lines are parallel
            if (denom === 0) {
                    return false;
            }

            var ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
            var ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;

            if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
                    return false;
            }

            return new Vector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
    }

    function intersect_line_box(p1, p2, p3, w, h)
    {
            var tl = {x: p3.x, y: p3.y};
            var tr = {x: p3.x + w, y: p3.y};
            var bl = {x: p3.x, y: p3.y + h};
            var br = {x: p3.x + w, y: p3.y + h};

            var result;
            if (result = intersect_line_line(p1, p2, tl, tr)) {return result;} // top
            if (result = intersect_line_line(p1, p2, tr, br)) {return result;} // right
            if (result = intersect_line_line(p1, p2, br, bl)) {return result;} // bottom
            if (result = intersect_line_line(p1, p2, bl, tl)) {return result;} // left

            return false;
    }
    
    return layout;

}

})();