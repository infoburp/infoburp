module('Function');

test('Unary function', function() {
    // The first node takes a number and increments it
    inc = UnaryFunctionNode('inc', function(n) {
        return n + 1;
    });

    // The second - decrements
    dec = UnaryFunctionNode('dec', function(n) {
        return n - 1;
    });

    // And the last - duplicates
    dup = UnaryFunctionNode('dup', function(n) {
        return n * 2;
    });

    // We connect them in chain: Incrementer -> Duplicator -> Decrementer
    Link(inc, dup);
    Link(dup, dec);
    
    // We put number 5 to the input of the first node
    inc.receive(5);

    equal(inc.result, 6, 'Number is incremented');
    equal(dup.result, 12, 'Then duplicated');
    equal(dec.result, 11, 'And then decremented');
});
