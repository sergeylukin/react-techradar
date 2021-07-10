import * as d3 from 'd3';
import _ from 'lodash';
import Chance from 'chance';

const MIN_BLIP_WIDTH = 12

class D3Component {

  containerEl;
  props;
  svg;
  ringCalculator;

  constructor(containerEl, props) {
    this.containerEl = containerEl;
    this.props = props;
    const { width, height } = props;
    this.svg = d3.select(containerEl)
      .append('svg')
      .style('background-color', 'white')
      .attr('id', 'radar-plot')
      .attr('width', width)
      .attr('height', height);
    this.updateDatapoints();
  }

  _center = () => {
    return Math.round(this.props.height / 2)
  }

  toRadian = (angleInDegrees) => {
    return Math.PI * angleInDegrees / 180
  }

  updateDatapoints = () => {
    const { svg, props: { data, width, height } } = this;
    const rings = ['Adopt', 'Hold', 'Assess', 'Trial'];
    const quadrants = [
      { order: 'first', startAngle: 90, name: 'Techniques', items: data.filter((item) => item.quadrant === "Techniques") },
      { order: 'second', startAngle: 0, name: 'Platforms', items: data.filter((item) => item.quadrant === "Platforms") },
      { order: 'third', startAngle: -90, name: 'Tools', items: data.filter((item) => item.quadrant === "Tools") },
      { order: 'fourth', startAngle: -180, name: 'languages-and-frameworks', items: data.filter((item) => item.quadrant === "languages-and-frameworks")  }
    ]

    this.ringCalculator = new RingCalculator(rings.length, this._center())

    quadrants.forEach((quadrant) => {
      const quadrantGroup = this.plotQuadrant(rings, quadrant)
      this.plotLines(quadrantGroup, quadrant)
      this.plotTexts(quadrantGroup, rings, quadrant)
      this.plotBlips(quadrantGroup, rings, quadrant)
    })
    console.log(quadrants)
    // alternatives = radar.getAlternatives()
    // currentSheet = radar.getCurrentSheet()
    console.log(rings)
    // svg.selectAll('circle')
    //   .data(data)
    //   .enter()
    //   .append('circle')
    //   .style('fill', 'red')
    //   .attr('cx', () => Math.random() * width)
    //   .attr('cy', () => Math.random() * height)
    //   .attr('r', 10)
    //   .on('mouseup', (evt, d) => this.setActiveDatapoint(d));
  }

  plotQuadrant = (rings, quadrant) => {
    const { svg, ringCalculator, _center, toRadian } = this;
    var quadrantGroup = svg.append('g')
      .attr('class', 'quadrant-group quadrant-group-' + quadrant.order)
      // .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
      // .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
      // .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle))

    rings.map((ring, i) => {
      var arc = d3.arc()
        .innerRadius(ringCalculator.getRadius(i))
        .outerRadius(ringCalculator.getRadius(i + 1))
        .startAngle(toRadian(quadrant.startAngle))
        .endAngle(toRadian(quadrant.startAngle - 90))

      quadrantGroup.append('path')
        .attr('d', arc)
        .attr('class', 'ring-arc-' + i)
        .attr('transform', 'translate(' + _center() + ', ' + _center() + ')')
    })

    return quadrantGroup
  }

  plotLines = (quadrantGroup, quadrant) => {
    const { toRadian, _center } = this;
    const size = this.props.height
    var startX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle)) + 1) / 2)
    var endX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle - 90)) + 1) / 2)

    var startY = size * (1 - (Math.cos(toRadian(quadrant.startAngle)) + 1) / 2)
    var endY = size * (1 - (Math.cos(toRadian(quadrant.startAngle - 90)) + 1) / 2)

    if (startY > endY) {
      var aux = endY
      endY = startY
      startY = aux
    }

    quadrantGroup.append('line')
      .attr('x1', _center()).attr('x2', _center())
      .attr('y1', startY - 2).attr('y2', endY + 2)
      .attr('stroke-width', 10)

    quadrantGroup.append('line')
      .attr('x1', endX).attr('y1', _center())
      .attr('x2', startX).attr('y2', _center())
      .attr('stroke-width', 10)
  }

  plotTexts = (quadrantGroup, rings, quadrant) => {
    const { _center, ringCalculator } = this;
    rings.forEach(function (ring, i) {
      if (quadrant.order === 'first' || quadrant.order === 'fourth') {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', _center() + 4)
          .attr('x', _center() + (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) / 2)
          .attr('text-anchor', 'middle')
          .text(ring)
      } else {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', _center() + 4)
          .attr('x', _center() - (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) / 2)
          .attr('text-anchor', 'middle')
          .text(ring)
      }
    })
  }

  plotBlips = (quadrantGroup, rings, quadrant) => {
    const { addRing, ringCalculator, drawBlipInCoordinates, findBlipCoordinates } = this;
    var blips = quadrant.items

    d3.select('.quadrant-table.' + quadrant.order)
      .append('h2')
      .attr('class', 'quadrant-table__name')
      .text(quadrant.name)

    rings.forEach((ring, i) => {
      var ringBlips = blips.filter(function (blip) {
        return blip.ring === ring
      })

      if (ringBlips.length === 0) {
        return
      }

      var maxRadius, minRadius

      minRadius = ringCalculator.getRadius(i)
      maxRadius = ringCalculator.getRadius(i + 1)

      var sumRing = ring.split('').reduce(function (p, c) {
        return p + c.charCodeAt(0)
      }, 0)
      var sumQuadrant = quadrant.name.split('').reduce(function (p, c) {
        return p + c.charCodeAt(0)
      }, 0)
      chance = new Chance(Math.PI * sumRing * ring.length * sumQuadrant * quadrant.name.length)

      var ringList = addRing(ring, quadrant.order)
      var allBlipCoordinatesInRing = []

      ringBlips.forEach(function (blip) {
        const coordinates = findBlipCoordinates(blip,
          minRadius,
          maxRadius,
          quadrant.startAngle,
          allBlipCoordinatesInRing)

        allBlipCoordinatesInRing.push(coordinates)
        drawBlipInCoordinates(blip, coordinates, quadrant.order, quadrantGroup, ringList)
      })
    })
  }

  addRing = (ring, order) => {
    var table = d3.select('.quadrant-table.' + order)
    table.append('h3').text(ring)
    return table.append('ul')
  }

  triangle = (blip, x, y, order, group) => {
    return group.append('path').attr('d', 'M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406')
      .attr('transform', 'scale(' + (blip.width / 34) + ') translate(' + (-404 + x * (34 / blip.width) - 17) + ', ' + (-282 + y * (34 / blip.width) - 17) + ')')
      .attr('class', order)
  }

  drawBlipInCoordinates = (blip, coordinates, order, quadrantGroup, ringList) => {
    const { triangle } = this;
    var x = coordinates[0]
    var y = coordinates[1]

    var group = quadrantGroup.append('g').attr('class', 'blip-link').attr('id', 'blip-link-' + blip.id)

    triangle(blip, x, y, order, group)

    group.append('text')
      .attr('x', x)
      .attr('y', y + 4)
      .attr('class', 'blip-text')
      // derive font-size from current blip width
      .style('font-size', ((blip.width * 10) / 22) + 'px')
      .attr('text-anchor', 'middle')
      .text(blip.id)

    // var blipListItem = ringList.append('li')
    // var blipText = blip.number() + '. ' + blip.name() + (blip.topic() ? ('. - ' + blip.topic()) : '')
    // blipListItem.append('div')
    //   .attr('class', 'blip-list-item')
    //   .attr('id', 'blip-list-item-' + blip.number())
    //   .text(blipText)

    // var blipItemDescription = blipListItem.append('div')
    //   .attr('id', 'blip-description-' + blip.number())
    //   .attr('class', 'blip-item-description')
    // if (blip.description()) {
    //   blipItemDescription.append('p').html(blip.description())
    // }

    // var mouseOver = function () {
    //   d3.selectAll('g.blip-link').attr('opacity', 0.3)
    //   group.attr('opacity', 1.0)
    //   blipListItem.selectAll('.blip-list-item').classed('highlight', true)
    //   tip.show(blip.name(), group.node())
    // }

    // var mouseOut = function () {
    //   d3.selectAll('g.blip-link').attr('opacity', 1.0)
    //   blipListItem.selectAll('.blip-list-item').classed('highlight', false)
    //   tip.hide().style('left', 0).style('top', 0)
    // }

    // blipListItem.on('mouseover', mouseOver).on('mouseout', mouseOut)
    // group.on('mouseover', mouseOver).on('mouseout', mouseOut)

    // var clickBlip = function () {
    //   d3.select('.blip-item-description.expanded').node() !== blipItemDescription.node() &&
    //     d3.select('.blip-item-description.expanded').classed('expanded', false)
    //   blipItemDescription.classed('expanded', !blipItemDescription.classed('expanded'))

    //   blipItemDescription.on('click', function () {
    //     d3.event.stopPropagation()
    //   })
    // }

    // blipListItem.on('click', clickBlip)
  }

  calculateBlipCoordinates = (blip, chance, minRadius, maxRadius, startAngle) => {
    const { toRadian, _center } = this
    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle))
    var adjustY = -Math.cos(toRadian(startAngle)) - Math.sin(toRadian(startAngle))

    var radius = chance.floating({ min: minRadius + blip.width / 2, max: maxRadius - blip.width / 2 })
    var angleDelta = Math.asin(blip.width / 2 / radius) * 180 / Math.PI
    angleDelta = angleDelta > 45 ? 45 : angleDelta
    var angle = toRadian(chance.integer({ min: angleDelta, max: 90 - angleDelta }))

    var x = _center() + radius * Math.cos(angle) * adjustX
    var y = _center() + radius * Math.sin(angle) * adjustY

    return [x, y]
  }

  findBlipCoordinates = (blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing) => {
    const { thereIsCollision, calculateBlipCoordinates } = this;
    const maxIterations = 200
    var coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle)
    var iterationCounter = 0
    var foundAPlace = false

    while (iterationCounter < maxIterations) {
      if (thereIsCollision(blip, coordinates, allBlipCoordinatesInRing)) {
        coordinates = calculateBlipCoordinates(blip, chance, minRadius, maxRadius, startAngle)
      } else {
        foundAPlace = true
        break
      }
      iterationCounter++
    }

    if (!foundAPlace && blip.width > MIN_BLIP_WIDTH) {
      blip.width = blip.width - 1
      return findBlipCoordinates(blip, minRadius, maxRadius, startAngle, allBlipCoordinatesInRing)
    } else {
      return coordinates
    }
  }

  thereIsCollision = (blip, coordinates, allCoordinates) => {
    return allCoordinates.some(function (currentCoordinates) {
      return (Math.abs(currentCoordinates[0] - coordinates[0]) < blip.width) && (Math.abs(currentCoordinates[1] - coordinates[1]) < blip.width)
    })
  }

  setActiveDatapoint = (d) => {
    console.log(d)
    console.log(d)
    d3.select(node).style('fill', 'yellow');
    this.props.onDatapointClick(d);
  }

  resize = (width, height) => {
    const { svg } = this;
    svg.attr('width', width)
      .attr('height', height);
  }
}

function RingCalculator(numberOfRings, maxRadius) {
  var sequence = [0, 6, 5, 3, 2, 1, 1, 1]

  var self = {}

  self.sum = function (length) {
    return sequence.slice(0, length + 1).reduce(function (previous, current) {
      return previous + current
    }, 0)
  }

  self.getRadius = function (ring) {
    var total = self.sum(numberOfRings)
    var sum = self.sum(ring)

    return maxRadius * sum / total
  }

  return self
}

export default D3Component;
