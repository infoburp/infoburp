/*
Link class represents the arc which connects two nodes.*/

Link = atom.Class({
    // Link takes source and destination nodes, and link type
    initialize: function(start, end, type) {
        this.start = start;
        this.end   = end;
        this.type  = type;

        // Notify nodes the link is estabilished
        start.connect(this);
        end.connect(this, true);
    },

    // Push data to the destination node
    push: function(data) {
        this.end.receive(data, this);
    },

    // Pull data from the source node
    pull: function() {
        return this.start.send(this);
    },
});
