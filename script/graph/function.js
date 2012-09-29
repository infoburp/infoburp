/* An unary pure function node
*/

UnaryFunctionNode = atom.Class({
    Extends: Node,
    
    // In addition to name, this node accepts a JavaScript function
    initialize: function(name, func) {
        this.parent(name);

        this.func = func;
    },

    // Upon data receive, we update internal result cache and send result further
    receive: function(data) {
        this.result = this.func(data);
        
        for(var i = 0; i < this.output.length; ++i) {
            this.output[i].push(this.result);
        }
    },

    // Upon request, we send the result
    send: function() {
        return this.result;
    },
})