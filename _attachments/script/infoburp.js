DISTANCE=100;

NEW_NODE_TEMPLATE=function(){return {nodehtml:"New node"};}; // Making just {} makes awesome bug.

RADIUS_OF_LINKING=5; // Defines distance 

dragged_node_number=null;
dragged_link_number=null;


var width = 960, 
    height = 500, 
    fill = d3.scale.category20();

var previous_graph_state = restore_graph_state();
// persistence/basic_persistence.js

global_data={nodes:[], links:[]};


global_data.nodes = previous_graph_state.nodes;
global_data.links = restore_links(previous_graph_state);

var vis = d3.select("#chart").append("svg").attr("width", width).attr("height", height).attr("pointer-events", "all").append('svg:g').call(d3.behavior.zoom().on("zoom", redraw)).append('svg:g');

vis.append("rect").attr("width", width).attr("height", height);

var force = d3.layout.force()
    .distance(DISTANCE)
    .nodes(global_data.nodes)
    .links(global_data.links)
    .size([width, height]);

var cursor = vis.append("circle").attr("r", 0).attr("transform", "translate(-100,-100)").attr("class", "cursor");


// this function based on http://bl.ocks.org/2653660

function insert_editor(d,i){
    
var p = this.parentNode;
        console.log(this, arguments);
        
        // inject a HTML form to edit the content here...

        var el = d3.select(this);
        var p_el = d3.select(p);
        
        var frm = p_el.append("xhtml:form");
        
        var inp = frm
	            .attr("class","editor-form")
                    .append("input")
                        .attr("value", function() {
                            // nasty spot to place this call, but here we are sure that the <input> tag is available
                            // and is handily pointed at by 'this':
                            this.focus();
                            
                            return d.nodehtml;
                        })
                        .attr("style", "width: 294px;")
                        // make the form go away when you jump out (form looses focus) or hit ENTER:
                        .on("blur", function() {
                            console.log("blur", this, arguments);
    
                            var txt = inp.node().value;
                            
                            d.nodehtml = txt;
                                                        
                            p_el.select("form.editor-form").remove();
                        })
                        .on("keypress", function() {
 
                            var e = d3.event;
                            if (e.keyCode == 13)
				{

                                    if (e.stopPropagation)
					e.stopPropagation();
                                    e.preventDefault();
        
                                    var txt = inp.node().value;
                                
                                    d.nodehtml = txt;
                                    el
					.text(function(d) { return d.nodehtml; });
                                
                                    p_el.select("form.editor-form").remove();
				}
                            });


    
    };















function tick_fu() {
	vis.selectAll("line.link")
	    .attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	vis.selectAll(".node")
	    .attr("x", function(d) { return d.x; })
	    .attr("y", function(d) { return d.y; });
    };

force.on("tick",tick_fu);


force.start();

vis.on("mousemove", function() {
	cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
});


var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
        

function dragstart(d, i) {
    force.stop(); // stops the force auto positioning before you start dragging
    
    if ( d3.event.sourceEvent.srcElement.className!=="blockdragging"){
	    
	
	var new_node=NEW_NODE_TEMPLATE();

        new_node.x=d.x+5;
        new_node.y=d.y;
    
	dragged_node_number=global_data.nodes.push(new_node)-1;
	
	dragged_link_number=global_data.links.push({source:d,target:new_node})-1;
	
        
        //alert("Added node");
	restart();
    }

}

    function dragmove(d, i) {

	//Moving new node;
	
	if (global_data.nodes[dragged_node_number]){
            global_data.nodes[dragged_node_number].x = d3.event.x;
            global_data.nodes[dragged_node_number].y = d3.event.y;
	};

	tick_fu();
    }

function dragend(d, i) {


if ( d3.event.sourceEvent.srcElement.className!=="blockdragging"){
	    
	var flag=true;
	global_data.nodes.forEach(function(target,num){
				      
				      var X=d3.event.sourceEvent.x -target.x;
				      var Y=d3.event.sourceEvent.y -target.y;
				      //console.log(d3.event.sourceEvent.x);
				      console.log("X,Y",X,Y);
				      
				     
				      if ((Math.sqrt(X*X+Y*Y)<RADIUS_OF_LINKING) && ( (X!==0) && (Y!==0) )&& flag && (num!==dragged_node_number) ){
					  console.log(flag);
					  

					  global_data.links[dragged_link_number].target=target;
					  
					  global_data.nodes.splice(dragged_node_number,dragged_node_number);
					  console.log(global_data);
					  //alert("Added link");
					  flag=false;
					  restart();
				      };
				      
				  }


	);
	

	    }
	force.start();

    };




function restart() {

    //alert("restart");
    var loc_nodes=vis.selectAll(".node")
	.data(global_data.nodes);

    var new_nodes=loc_nodes.enter().insert("foreignObject")
	.attr("class", "node")
	.attr("height",50)
	.attr("width",50)
	.attr("x", function(d) { return d.x; })
	.attr("y", function(d) { return d.y; })
	.call(node_drag);
    
    loc_nodes.exit().remove();


    new_nodes.append("xhtml:body")
	.attr("class","nodebody");

    var bodies = new_nodes.selectAll(".nodebody");
    
    bodies.append("xhtml:form")
	.append("input")
	.attr("type","button")
	.attr("class","blockdragging")
	.attr("value","Edits")
        .on("click",insert_editor);	

    bodies.append("xhtml:div")
	.attr("class","nodehtml")
	.html(function(d){return "nodehtml=" +this.parentElement.__data__.nodehtml;
			  //return (this.parentElement.__data__.x);console.log(this.parentElement.__data__);  
			 });	

    vis.selectAll("line.link")
	.data(global_data.links)
	.enter().insert("line", "foreighnObject.node")
	.attr("class", "link")
	.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
}

restart();

function redraw() {

	console.log("here", d3.event.translate, d3.event.scale);
	vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

