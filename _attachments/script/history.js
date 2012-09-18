goog.provide("ib.History");


goog.require("goog.structs.Queue");

ib.History= function (Editor1,Editor2){
    
    this.primary=Editor1;
    this.secondary=Editor2;
    this.queue= new goog.structs.Queue();
    
};


function refreshDataForSelectedOfType(selectedType,baseField){
    
    global_data.nodes
        .filter(function(d, i) {
                    return d.selected && (d.selectedAs === selectedType);
                })
        .forEach(function(d) {
                     d.nodehtml = baseField.getCleanContents();
                     infoburpContentTypeHandlerRegistry.attachRender(d);
                     d.html_need_refresh = true;
                     //graphInterface.tickClosure()();
                 });
}







ib.History.prototype.refreshData = function (){

    refreshDataForSelectedOfType('red',this.primary);
    refreshDataForSelectedOfType('yellow',this.secondary);

};


ib.History.prototype.clearHistory=function(){
    
    this.queue.clear();
    
};


ib.History.prototype.newActiveNode = function(nodeData){
   
    console.log('History length',this.queue.getCount());
    
    // If there are to nodes put out first and make it green
    if (this.queue.getCount() == 2){
        previousNode =this.queue.dequeue();
        previousNode.selected=false;
        previousNode.selectedAs='green';
    } else {
        
           
    }

    // if only one node then paint it red
 
    if (this.queue.getCount() == 1){
        
        nowSelected=this.queue.peek();
        
        nowSelected.selectedAs='red';
        nowSelected.selected=true;
        
    }


        
    nodeData.selected = true;
    
    nodeData.selectedAs= 'yellow';


    this.queue.enqueue(nodeData);


};


ib.History.prototype.linkEditors = function (){

    

};



