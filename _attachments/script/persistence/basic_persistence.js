
// Creating graph database which would hold json that describes current


function restore_link(linkObj,linkIndex){

// There is a problem with link serialization as target and source are nodes objects, and inter array pointers are not preserved this function should alleviate that problem
// TODO check if it works with node removed. It may not as index in array could be different from index property.
    
    return {
	source:nodes[linkObj.source.index],
	target:nodes[linkObj.target.index]
	};
    

    }



ID_OF_GRAPH_STATE="1";

restore_graph_state=function(){
var db_restore =  new CouchDB('graph_state',{"X-Couch-Full-Commit":"false"});

var graph_restore=db_restore.open(ID_OF_GRAPH_STATE);

return graph_restore;

    };

function restore_links(previous_graph_state){

     return $.map(previous_graph_state.links,restore_link);

    }


save_graph_state=function(){

var db =  new CouchDB('graph_state',{"X-Couch-Full-Commit":"false"});


var graph_state=restore_graph_state();

graph_state.nodes=nodes;



graph_state.links=links;


db.save(graph_state);

};


// Getting data from d3

//var links_objects = vis.selectAll('line.link').data();

//var nodes_objects= vis.selectAll('circle.node').data();

// Reformating links data as array of {source:some_int,target:other_int}

//extract_source_target=function (value,index) {
//  return {'source': value.source.index,  
//	    'target':value.target.index
//	   };
//};

//var links_json_proto = $.map(links_objects,extract_source_target);

// Reformatting nodes data as array of {'weight'}