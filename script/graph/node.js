/* Node module

This module implements generic Node class.
*/

Node = atom.Class({
    // Node init function. It receives node name, which is unique.
    initialize: function(name) {
        this.name = name;

        // List of child nodes
        this.children = [];

        // Lists of input and output links
        this.input = [];
        this.output = [];
    },

    // Register links with current node.
    connect: function(link, end) {
        // "End" argument shows if this node is end for the link
        if (end) {
            list = this.input;
            handler = this.addInput;
        } else {
            list = this.output;
            handler = this.addOutput;
        }

        list.push(link);
        
        if (handler) {
            handler.call(this, link);
        }
    },

    // TODO: remove links
    // TODO: Add/remove children

    /* In general, a node should implement receive and send event handlers.

    Receive is called when data comes to current node by link of specified type.*/
    receive: function(data, link) {
        throw "Not implemented.";
    },

    //send(type) is called when an output node requests data.
    send: function(link) {
        throw "Not implemented.";
    },

    // Here, they are defined abstractly; one must override them when subclassing Node.
});



