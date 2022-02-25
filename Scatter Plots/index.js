import { csv, scaleLinear, scaleOrdinal, max, format, extent } from 'd3';

const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

const attributes = [
  { value: 'sepal_length', label: 'Sepal Length' },
  { value: 'sepal_width', label: 'Sepal Width' },
  { value: 'petal_length', label: 'Petal Length' },
  { value: 'petal_width', label: 'Petal Width' }
];

const irisAxis = [
  'sepal length',
  'sepal width',
  'petal length',
  'petal width'
];

const classColor = {
  'Iris-setosa': '#ff6969',
  'Iris-versicolor': '#ffd769',
  'Iris-virginica': '#69ffa7'
};

const xAxisLabelOffset = 50;
const yAxisLabelOffset = 45;

const getLabel = value => {
  for(let i = 0; i < attributes.length; i++){
    if(attributes[i].value === value){
      return attributes[i].label;
    }
  }
};


const dropdownMenu = (selection, props) => {
  const {
    options,
    onOptionClicked,
    selectedOption
  } = props;
    
  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
    .merge(select)
    .on('change', function(){
      onOptionClicked(this.value);
    });
    
  const option = select.selectAll('option').data(options);
  option.enter().append('option')
    .merge(option)
    .attr('value', d => d)
    .property('selected', d => d === selectedOption)
    .text(d => d);
};

let data;
let XColumn;
let YColumn;

const onXColumnClicked = column => {
  XColumn = column;
  render();
};

const onYColumnClicked = column => {
  YColumn = column;
  render();
};


const render = () => {
  //xbar
  d3.select('#x-menu')
  	.call(dropdownMenu, {
      options: irisAxis,
      onOptionClicked: onXColumnClicked,
      selectedOption: XColumn
    });
    
  //ybar
  d3.select('#y-menu')
  	.call(dropdownMenu, {
      options: irisAxis,
      onOptionClicked: onYColumnClicked,
      selectedOption: YColumn
    });
    
  const title = 'Iris Scatter Plot';
  
  const xValue = d => d[XColumn];
  const xAxisLabel = XColumn;
  
  const yValue = d => d[YColumn];
  const yAxisLabel = YColumn;
  
  const margin = { top: 115, right: 250, bottom: 84, left: 120 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  //range
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();
    
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();
    
  const g = svg.selectAll('.container').data([null]);
  const gEnter = g
    .enter().append('g')
    .attr('class', 'container');
  gEnter.merge(g)
        .attr('transform',
          `translate(${margin.left},${margin.top})`
        );
    
  //axis
  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);
    
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);
    
  const yAxisG = g.select('.y-axis');
  const yAxisGEnter = gEnter
    .append('g')
    .attr('class', 'y-axis');
  yAxisG.merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.domain').remove();
    
  const yAxisLabelText = yAxisGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', -70)
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('text-anchor', 'middle')
    .merge(yAxisG.select('.axis-label'))
    .attr('x', -innerHeight / 2)
    .text(yAxisLabel);
    
  const xAxisG = g.select('.x-axis');
  const xAxisGEnter = gEnter
    .append('g')
    .attr('class', 'x-axis');
  xAxisG.merge(xAxisGEnter)
    		.attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('.domain').remove();
    
  const xAxisLabelText = xAxisGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', 75)
    .attr('fill', 'black')
    .merge(xAxisG.select('.axis-label'))
    .attr('x', innerWidth / 2)
    .text(xAxisLabel);
  
  const circleRadius = 8.5; 
  
  //point circle
  const circles = g.merge(gEnter).selectAll('circle').data(data);
  
  circles
    .enter().append('circle')
    .attr('cx', innerWidth / 2)
    .attr('cy', innerHeight / 2)
  	.merge(circles)
    .attr('cy', d => yScale(yValue(d)))
    .attr('cx', d => xScale(xValue(d)))
    .attr('r', circleRadius)
    .style('fill', d => classColor[d.class]);

// title text
gEnter.append('text')
    .attr('class', 'title')
    .attr('x', innerWidth / 2 - 220)
    .attr('y', -65)
    .text(title);
    
// axis text
gEnter.append('text')
    	.attr('x', 600)
    	.attr('y', 0)
    	.attr('font-size', '1.5em')
  		.attr('font-family', 'Poppins')
  		.attr('font-weight', 'bold')
    	.text('Axis:');

gEnter.append('text')
  		.attr('x', 600)  	
  		.attr('y', 35)	
    	.attr('font-size', '1.5em')
    	.text('X');
gEnter.append('text')
    	.attr('x', 600)
  		.attr('y', 85)
    	.attr('font-size', '1.5em')
    	.text('Y');
  
// class text
gEnter.append('text')
    .attr('x', 600)
    .attr('y', 125)
    .attr('font-size', '1.5em')
  	.attr('font-family', 'sans-serif')
    .text('Classes');
  
//setosa
gEnter.append('circle')
  			.attr('cx', 610)
    		.attr('cy', 145)
    		.attr('r', circleRadius)
    		.style('fill', classColor['Iris-setosa']);   
gEnter.append('text')
  			.attr('x', 625)
    		.attr('y', 152.5)
    		.attr('font-size', '1.5em')
  			.attr('font-family', 'sans-serif')
    		.text('setosa');
  
//versicolor
gEnter.append('circle')
  			.attr('cx', 610)
    		.attr('cy', 175)
    		.attr('r', circleRadius)
    		.style('fill', classColor['Iris-versicolor']);
gEnter.append('text')
  			.attr('x', 625)
    		.attr('y', 182.5)
    		.attr('font-size', '1.5em')
  			.attr('font-family', 'sans-serif')
    		.text('versicolor');
  
//virginica
gEnter.append('circle')
  			.attr('cx', 610)
    		.attr('cy', 205)
    		.attr('r', circleRadius)
    		.style('fill', classColor['Iris-virginica']);
gEnter.append('text')
  			.attr('x', 625)
    		.attr('y', 212.5)
    		.attr('font-size', '1.5em')
  			.attr('font-family', 'sans-serif')
    		.text('virginica');
};

// Read Dataset
d3.csv('https://raw.githubusercontent.com/harker2011/iris_test/main/iris.csv')
  .then(loadedData => {
    data = loadedData;
    data.pop();
    data.forEach(d => {
      d.sepalLength = +d['sepal length'];
      d.sepalWidth = +d['sepal width'];
      d.petalLength = +d['petal length'];
      d.petalWidth = +d['petal width'];
      d.class = d['class'];
    });
    XColumn = data.columns[0];
    YColumn = data.columns[1];
    render();
  });
