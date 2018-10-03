var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 20, b: 40, l: 60};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var parseDate = d3.timeParse("%Y %b %d");

var xScale = d3.scaleTime().range([0,chartWidth]);
var yScale = d3.scaleLinear().range([chartHeight,0]);
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var stack = d3.stack();

var area = d3.area()
    .x(function(d) { return xScale(d.data.date);})
    .y0(function(d) { return yScale(d[0]);})
    .y1(function(d) { return yScale(d[1]);});


var stack = d3.stack();

d3.csv('../browser.csv',
    function(row) {
        return {
            date: parseDate(row.date),
            'Google Chrome': +row['Google Chrome'] / 100,
            'Internet Explorer': + row['Internet Explorer'] / 100,
            'Firefox': +row['Firefox'] / 100,
            'Safari': +row['Safari'] / 100,
            'Microsoft Edge': +row['Microsoft Edge'] / 100,
            'Opera': +row['Opera'] / 100,
            'Mozilla': +row['Mozilla'] / 100,
            'Other/Unknown': +row['Other/Unknown'] / 100
        };
    },
    function(error, dataset) {
        if(error) {
            console.error('Error while loading ../browser.csv dataset.');
            console.error(error);
            return;
        }

        browsers = dataset.columns.slice(1);

        xScale.domain(d3.extent(dataset, function(d){
            return d.date;
        }));
        colorScale.domain(browsers);
        stack.keys(browsers);

        stackData = stack(dataset);

        var layerEnter = chartG.selectAll('.layer')
            .data(stackData)
            .enter().append('g')
            .attr('class', 'layer');

        layerEnter.append('path')
            .attr('class', 'area')
            .style('fill', function(d){
                return colorScale(d.key);
            })
            .attr('d', area);

        layerEnter
            .filter(function(d) {
                return d[d.length - 1][1] - d[d.length - 1][0] > 0.01;
            })
            .append('text')
            .attr('x', chartWidth - 10)
            .attr('y', function(d) {
                return yScale((d[d.length - 1][0] + d[d.length - 1][1]) / 2);
            })
            .attr('dy', '.35em')
            .text(function(d){
                return d.key;
            })

        chartG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate('+[0,chartHeight + 5]+')')
            .call(d3.axisBottom(xScale));

        chartG.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate('+[-5,0]+')')
            .call(d3.axisLeft(yScale).ticks(10,'%'));
    });
// Remember code outside of the data callback function will run before the data loads