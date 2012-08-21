// Creating graph database which would hold json that describes current

function restore_link(linkObj,linkIndex){

    // There is a problem with link serialization as target and source are nodes objects, and inter array pointers are
    //not preserved this function should alleviate that problem
    // TODO check if it works with node removed. It may not as index in array could be different from index property.
    
    return {
	source:global_data.nodes[linkObj.source.index],
	target:global_data.nodes[linkObj.target.index]
	};
    

}



ID_OF_GRAPH_STATE="1"; // id that is used for demo global graph. In future we can use it to distinct graphs

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

    graph_state.nodes=global_data.nodes;
    graph_state.links=global_data.links;    // Probably we should save only source.index and target.index

    db.save(graph_state);
};

// We saving graph state every 5 seconds.

setInterval(save_graph_state,5000);
