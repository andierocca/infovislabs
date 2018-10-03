var letters;

// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateChart(category);
}


var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 26 letters
var barBand = chartHeight / 26;
var barHeight = barBand * 0.7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var lettersMap = {
    'all-letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'only-consonants': 'BCDFGHJKLMNPQRSTVWXZ'.split(''),
    'only-vowels': 'AEIOUY'.split('')
};

var freq_scale = d3.scaleLinear().domain([0, 0.13]).range([0, chartWidth]);

d3.csv('./letter_freq.csv',
    // Load data and use this function to process each row
    function(row) {
        return {
            letter: row.letter,
            frequency: +row.frequency
        };
    },
    function(error, dataset) {
        // Log and return from an error
        if(error) {
            console.error('Error while loading ./letter_freq.csv dataset.');
            console.error(error);
            return;
        }

        // Create global variables here and intialize the chart
		letters = dataset;

        // **** Your JavaScript code goes here ****
        updateChart('all-letters');
    });

function updateChart(filterKey) {
    // Create a filtered array of letters based on the filterKey
    var filteredLetters = letters.filter(function(d){
        return lettersMap[filterKey].indexOf(d.letter) >= 0;
    });

	
    // **** Draw and Update your chart here ****
	console.log(filteredLetters);
	var letter = svg.selectAll('.letter')
		.data(filteredLetters);
	
	var letterEnter = letter.enter()
		.append('g')
		.attr('class', 'letter')
		
	letterEnter.merge(letter);
		
	letterEnter.append('rect')
		.attr('y', function(d, i) {return i * (chartHeight/29) + padding.t;})
		.attr('x', padding.l)
		.attr('fill', '#000000')
		.attr('height', 10)
		.attr('width', function(d, i) {return freq_scale(filteredLetters[i].frequency);});
	
	letterEnter.append('text')
		.attr('y', function(d, i) {return i * (chartHeight/29) + padding.t + 10;})
		.attr('x', 10)
		.text(function(d, i) {return filteredLetters[i].letter;});

	letter.exit().remove();
}
// Remember code outside of the data callback function will run before the data loads