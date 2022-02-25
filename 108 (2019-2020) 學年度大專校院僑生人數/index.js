const width = window.innerWidth,
      height = window.innerHeight,
      maxRadius = (Math.min(width, height) / 2) - 5;

const formatNumber = d3.format(',d');
const formatPercent = d3.format(".1%");

const x = d3.scaleLinear()
      .range([0, 2 * Math.PI])
      .clamp(true);

const y = d3.scaleSqrt()
      .range([maxRadius*.1, maxRadius]);

const color = d3.scaleOrdinal(d3.schemeCategory20c);

const partition = d3.partition();

let totalSize = 0;

const arc = d3.arc()
      .startAngle(d => x(d.x0))
      .endAngle(d => x(d.x1+d.x0))
      .innerRadius(d => Math.max(0, y(d.y0)))
      .outerRadius(d => Math.max(0, y(d.y1)));

const middleArcLine = d => {
      const halfPi = Math.PI/2;
      const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
      const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

      const middleAngle = (angles[1] + angles[0]) / 2;
      const invertDirection = middleAngle > 0 && middleAngle < Math.PI;
      if (invertDirection) { angles.reverse(); }

        const path = d3.path();
        path.arc(0, 0, r, angles[0], angles[1], invertDirection);
        return path.toString();
};

const textFits = d => {
      const CHAR_SPACE = 6;

      const deltaAngle = x(d.x1) - x(d.x0);
      const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
      const perimeter = r * deltaAngle;

      return d.data.name.length * CHAR_SPACE < perimeter;
};

const svg = d3.select('body').append('svg')
			.attr("height",'420').attr("width",'950')
			/*.call(d3.zoom().on("zoom", function () {
    	   svg.attr("transform", d3.event.transform)
    	}))*/
      .attr('viewBox', `${-width /2} ${-height / 2} ${width} ${height}`)
      .on("click", function() {
          focusOn();// Reset zoom on canvas click
					/*svg.selectAll('g.slice')  // For new circle, go through the update process
            //.data(dataset)
            .on("mouseover", {
            	text(children.size)
          	})
					*/
        })
			//.on('click', () => focusOn()); // Reset zoom on canvas click


d3.json('hw.json', (error, root) => {
      if (error) throw error;
  
      root = d3.hierarchy(root);
      root.sum(d => d.size);
  		totalSize = root.sum;

      const slice = svg.selectAll('g.slice')
          .data(partition(root).descendants());

      slice.exit().remove();

      const newSlice = slice.enter()
          .append('g').attr('class', 'slice')
          .on('click', d => {
              d3.event.stopPropagation();
              focusOn(d);
            	/*on("mouseover", {
            		.text(d.value);
          		})*/
          });

      newSlice.append('title')
          .text(d => d.data.name + '\n' + formatNumber(d.value) + '\n' + formatPercent((d.value)/(12562)));

      newSlice.append('path')
          .attr('class', 'main-arc')
          .style('fill', d => color((d.children ? d : d.parent).data.name))
          .attr('d', arc);

      newSlice.append('path')
          .attr('class', 'hidden-arc')
          .attr('id', (_, i) => `hiddenArc${i}`)
          .attr('d', middleArcLine);

      const text = newSlice.append('text')
      		//.attr("transform", transform)
          .attr('display', d => textFits(d) ? null : 'none')
  				.style('font-size', '8px')
    			.style('font-style', '微軟正黑體');

      // Add white contour
      text.append('textPath')
          .attr('startOffset','50%')
          .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
          .text(d => d.data.name)
          .style('fill', 'none')
          .style('stroke', '#fff')
          .style('stroke-width', 5)
          .style('stroke-linejoin', 'round');

      text.append('textPath')
          .attr('startOffset','50%')
          .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
          .text(d => d.data.name);
});
function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
      // Reset to top-level if no data point specified
  
      const transition = svg.transition()
      		
          .duration(1000)
          .tween('scale', () => {
            	const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                    yd = d3.interpolate(y.domain(), [d.y0, 1]);
                    return t => { x.domain(xd(t)); y.domain(yd(t)); };
          });

            transition.selectAll('path.main-arc')
                .attrTween('d', d => () => arc(d));

            transition.selectAll('path.hidden-arc')
                .attrTween('d', d => () => middleArcLine(d));

            transition.selectAll('text')
                .attrTween('display', d => () => textFits(d) ? null : 'none');

            moveStackToFront(d);


      function moveStackToFront(elD) {
          svg.selectAll('.slice').filter(d => d === elD)
              .each(function(d) {
              this.parentNode.appendChild(this);
              if (d.parent) { moveStackToFront(d.parent); }
              })