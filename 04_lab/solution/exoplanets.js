
// **** Your JavaScript code goes here ****

var svg = d3.select('svg');


// Create x-scale for positioning the circles
var xScale = d3.scaleLinear()
    .range([100,500]);

// Create y-scale for positioning the circles
var yScale = d3.scaleLog()
    .range([60,660]);


// Create square root scale to scale the Area of the circles
// Note that area is a more effective visual encoding
var rScale = d3.scaleSqrt()
    .range([0,20]);

// Create a quantize scale for the three habital zone bins
var colorScale = d3.scaleQuantize()
    .range(['#d64d3f', '#96ac3d', '#208d8d']);

// Load the dataset
d3.csv('./exoplanets.csv', function(error, dataset) {
    planets = dataset;

    // Use extent and max to compute the input domain for the scales
    var radiusMax = d3.max(planets, function(d){
        return +d['radius'];
    });
    rScale.domain([0, radiusMax]);
    var massExtent = d3.extent(planets, function(d){
        return +d['mass'];
    });
    yScale.domain(massExtent);
    var hzdExtent = d3.extent(planets, function(d){
        return +d['habital_zone_distance'];
    });
    colorScale.domain(hzdExtent);
    xScale.domain(hzdExtent);

    // Create a d3 selection for the planets
    svg.selectAll('.planet')
        .data(planets) // Data-bind the planets array to the d3-selection
        .enter() // Enter - selects incoming data-bound elements
        .append('circle') // Append - append a circle for each planet
        .attr('class', 'planet') // Add the classname that we selected on
        .attr('r', function(d){
            // Set the radius attribute based on the planet's radius
            return rScale(d['radius']);
        })
        .attr('cx', function(d){
            // Set the x-position based on the hzd value
            return xScale(d['habital_zone_distance']);
        })
        .attr('cy', function(d){
            // Set the y-position based on the mass value
            return yScale(d['mass']);
        })
        .style('fill', function(d){
            // Set the fill color based on the hzd value
            return colorScale(d['habital_zone_distance']);
        });

    // Create axes for both the y- and x-scale
    svg.append('g') // Append a g element for the scale
        .attr('class', 'x axis') // Use a class to css style the axes together
        .attr('transform', 'translate(0,40)') // Position the axis
        .call(d3.axisTop(xScale)); // Call the axis function

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,680)')
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(70,0)')
        .call(d3.axisLeft(yScale));

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(530,0)')
        .call(d3.axisRight(yScale));

    // Challenge Problems
    // Add a label for Earth, Mars, Venus Mercury

    // Create an additional data array with pointers to only the labeled planetes
    planetLabels = planets.filter(function(d){
        return d['name'] == 'Earth' || d['name'] == 'Mars'
               || d['name'] == 'Venus' || d['name'] == 'Mercury';
    });

    // Create a new d3-selection. And append a new text element for the data array.
    svg.selectAll('.planet-label')
        .data(planetLabels)
        .enter()
        .append('text')
        .attr('class', 'planet-label')
        .attr('x', function(d){
            return xScale(d['habital_zone_distance']) + 10;
        })
        .attr('y', function(d){
            return yScale(d['mass']) + rScale(d['radius']);
        })
        .text(function(d){
            return d['name'];
        });
});