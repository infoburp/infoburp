nodes = [
    {
        label: 'John',
    },
    {
        label: 'Jane',
    },
    {
        label: 'Jill',
    },
    {
        label: 'Paul',
    },
];

links = [
    {
        source: nodes[0],
        target: nodes[1],
    },
    {
        source: nodes[1],
        target: nodes[2],
    },
    {
        source: nodes[3],
        target: nodes[0],
    },
    {
        source: nodes[2],
        target: nodes[3],
    },
];

function test() {
    var width = window.innerWidth,
        height = window.innerHeight;

    var svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height);

    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(300)
        .charge(-120)
        .start();

    var group = svg.selectAll('circle')
        .data(nodes)
        .enter().append('svg:g')

    var node = group.append('circle')
            .attr('r', 50)
            .style('fill', '#CCCCCC')
            .call(force.drag);

    var fo = group.append('foreignObject')
        .attr('width', 50)
        .attr('height', 50);
    
    fo.append('xhtml:div')
        .text(function(d) { return d.label })
        .attr('contenteditable', true);

    var link = svg.selectAll('line')
        .data(links)
        .enter()
            .append('line')
            .style('stroke-width', 1)
            .style('stroke', '#CCCCCC');

    force.on('tick', function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        fo.attr('x', function(d) { return d.x - 25; })
            .attr('y', function(d) { return d.y - 25; })
    });


    /*var c = svg.selectAll("circle").data(data).enter();

    function coord(d, i) {
        return (i + 1) * 100;
    };

    nodes = c.append('svg:g')
    
    nodes.append('svg:circle')
        .attr('cx', coord)
        .attr('cy', coord)
        .attr('r', 50)
        .style('fill', '#EEEEEE')



*/
};
