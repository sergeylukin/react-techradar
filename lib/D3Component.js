import * as d3 from 'd3';

class D3Component {

  containerEl;
  props;
  svg;

  constructor(containerEl, props) {
    this.containerEl = containerEl;
    this.props = props;
    const { width, height } = props;
    this.svg = d3.select(containerEl)
      .append('svg')
      .style('background-color', 'white')
      .attr('width', width)
      .attr('height', height);
    this.updateDatapoints();
  }

  updateDatapoints = () => {
    const { svg, props: { data, width, height } } = this;
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .style('fill', 'red')
      .attr('cx', () => Math.random() * width)
      .attr('cy', () => Math.random() * height)
      .attr('r', 10)
      .on('mouseup', (d, i, nodes) => this.setActiveDatapoint(d, nodes[i]));
  }

  setActiveDatapoint = (d, node) => {
    d3.select(node).style('fill', 'yellow');
    this.props.onDatapointClick(d);
  }

  resize = (width, height) => {
    const { svg } = this;
    svg.attr('width', width)
      .attr('height', height);
    svg.selectAll('circle')
      .attr('cx', () => Math.random() * width)
      .attr('cy', () => Math.random() * height);
  }
}

export default D3Component;
