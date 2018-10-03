var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');

var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
var linkScale = d3.scaleSqrt().range([1,5]);

var simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d) { return d.id;}))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

var drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);

// ******** Challenge 1: Add Tooltip *******//
// Create tooltip object
// Use html data callback to show the id for the node
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>"+d['id']+"</h5>";
    });

// Call tooltip to initialize it to document and svg
svg.call(toolTip);

d3.json('./les_miserables.json',
    function(error, dataset) {
        if(error) {
        console.error('Error while loading ./les_miserables.json dataset.');
        console.error(error);
        return;
    }

    // Make a global variable of the dataset
    network = dataset;

    // Log the network to inspect links & nodes lists
    console.log(network);

    // Update link scale based on the extent of the link values
    linkScale.domain(d3.extent(network.links, function(d){ return d.value;}));

    // Create separate link & node group elements
    // Ensures that links show below nodes
    var linkG = svg.append('g')
        .attr('class', 'links-group');
    var nodeG = svg.append('g')
        .attr('class', 'nodes-group');

    // Append weighted lines for each link in network
    var linkEnter = linkG.selectAll('.link')
        .data(network.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke-width', function(d) {
            return linkScale(d.value);
        });

    // Append circles for each node in the graph
    var nodeEnter = nodeG.selectAll('.node')
        .data(network.nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', 6)
        .style('fill', function(d) {
            return colorScale(d.group);
        })
        .on('mouseover', toolTip.show) // Add mouse hover tooltip listeners
        .on('mouseout', toolTip.hide)
        .call(drag); // Call drag object to setup all drag listeners for nodes

    // Set up the nodes for the simulation
    // Note this has to be done before we set up the links in the next block
    simulation
        .nodes(dataset.nodes)
        .on('tick', tickSimulation);

    // Set up the links and what type of force will be used for the simulation
    // Again note that this has to be done in a separate block from above
    simulation
        .force('link')
        .links(dataset.links);

    // Tick simulation callback called on every iteration of the simulation
    // Think of ticks like frames of a video file
    function tickSimulation() {
        linkEnter
            .attr('x1', function(d) { return d.source.x;})
            .attr('y1', function(d) { return d.source.y;})
            .attr('x2', function(d) { return d.target.x;})
            .attr('y2', function(d) { return d.target.y;});

        nodeEnter
            .attr('cx', function(d) { return d.x;})
            .attr('cy', function(d) { return d.y;});
    }
});

// Handlers for drag events on nodes
// Drag events adjust the [fx,fy] of the nodes to override the simulation
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);

    // ******** Challenge 2: Fix/Pin Nodes *******//
    // Keeping the [fx,fy] at the dragged positioned will pin it
    // Setting to null allows the simulation to change the [fx,fy]
    // d.fx = null;
    // d.fy = null;
}