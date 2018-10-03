var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 40, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var parseDate = d3.timeParse('%Y %b %d');
var formatDate = d3.timeFormat('%b %e, %Y');

var xScale = d3.scaleTime().range([0,chartWidth]);
var yScale = d3.scaleLinear().range([chartHeight,0]);
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([chartWidth, chartHeight])
    .round(true)
    .paddingInner(1);

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

        treesByDate = dataset.map(function(d){
            return {name: 'root', date: d.date,
                children: browsers.map(function(b){return {name: b, value: d[b]};})
            }
        });

        var step = 0;

        d3.interval(function(){
            updateChart(step);

            step++;
            if(step == treesByDate.length) step = 0;
        }, 250);
    });

function updateChart(step) {
    var root = d3.hierarchy(treesByDate[step])
      .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name.replace(/ /g,''); })
      .sum(function(d) {return d.value;});

    treemap(root);

    var cell = chartG.selectAll('.cell')
        .data(root.leaves(), function(d){
            return d.data.id;
        });

    var cellEnter = cell.enter().append('g')
        .attr('class', 'cell');

    cellEnter.append('rect')
        .attr('id', function(d){ return d.data.id;})
        .style('fill', function(d){ return colorScale(d.data.id);});

    cellEnter.append('clipPath')
        .attr('id', function(d){ return 'clip-'+d.data.id;})
        .append('use')
        .attr('xlink:href', function(d){ return '#' + d.data.id;});

    cellEnter.append('text')
        .attr('clip-path', function(d){ return 'url(#clip-' + d.data.id + ')';})
        .attr('x', 4)
        .attr('y', '1.3em')
        .text(function(d){return d.data.name;});

    var t = d3.transition()
        .duration(100);

    var cellMerge = cell.merge(cellEnter);

    cellMerge.transition(t)
        .attr('transform', function(d) {
            return 'translate(' + [d.x0, d.y0] + ')';
        });

    cellMerge.select('rect')
        .transition(t)
        .attr('width', function(d){ return d.x1 - d.x0;})
        .attr('height', function(d){ return d.y1 - d.y0;});

    var dateLabel = svg.selectAll('.date-label')
        .data([treesByDate[step].date]);

    dateLabel.enter().append('text')
        .attr('class', 'date-label')
        .attr('y', svgHeight - 20)
        .attr('x', 200);

    dateLabel.text(function(d){ return formatDate(d);});
}


// Remember code outside of the data callback function will run before the data loads