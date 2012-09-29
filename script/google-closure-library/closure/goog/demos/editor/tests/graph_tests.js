/*
Tests for Link and Node classes
*/

module('Graph');
test('Linking nodes', function() {
    // Create two dummy nodes
    MyNode = atom.Class({
        Extends: Node,
        addOutput: function(link) {
            this.out = link;
        },
        addInput: function(link) {
            this.inp = link;
        },
    });
    
    start = MyNode();
    end = MyNode();

    // Link them
    link = Link(start, end);

    //Check
    equal(start.out, link, 'Input is linked');
    equal(end.inp,   link, 'Output too');
});

test('Passing messages', function() {
    // This node receives a number, increments it, and sends to output
    Incrementer = atom.Class({
        Extends: Node,

        receive: function(number) {
            // A number is received. We need to increment it and send.
            this.number = number + 1;
            
            if (this.output.length) {
                this.output[0].push(this.number);
            }
        },

        send: function() {
            if (this.input.length) {
                return this.input[0].pull();
            } else {
                return this.number;
            }
        }
    });

    a = Incrementer();
    b = Incrementer();
    c = Incrementer();
    Link(a, b);
    Link(b, c);

    a.receive(0);
    equal(c.number, 3, 'Message is pushed');

    equal(c.send(), 1, 'And pulled')
});
