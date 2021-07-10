import * as d3 from 'd3';
import d3tip from 'd3-tip';
import _ from 'lodash';
import Chance from 'chance';

const MIN_BLIP_WIDTH = 12
const ANIMATION_DURATION = 1000

class D3Component {

  containerEl;
  props;
  svg;
  ringCalculator;
  tip;

  constructor(containerEl, props) {
    this.containerEl = containerEl;
    this.props = props;
    const { width, height } = props;

    this.tip = d3tip().attr('class', 'd3-tip').html(function (text) {
      return text
    })

    this.tip.direction(function () {
      if (d3.select('.quadrant-table.selected').node()) {
        var selectedQuadrant = d3.select('.quadrant-table.selected')
        if (selectedQuadrant.classed('first') || selectedQuadrant.classed('fourth')) { return 'ne' } else { return 'nw' }
      }
      return 'n'
    })

    this.rings = ['Adopt', 'Hold', 'Assess', 'Trial'];
    const { data } = props
    this.quadrants = [
      { order: 'first', startAngle: 90, name: 'Techniques', items: data.filter((item) => item.quadrant === "Techniques") },
      { order: 'second', startAngle: 0, name: 'Platforms', items: data.filter((item) => item.quadrant === "Platforms") },
      { order: 'third', startAngle: -90, name: 'Tools', items: data.filter((item) => item.quadrant === "Tools") },
      { order: 'fourth', startAngle: -180, name: 'languages-and-frameworks', items: data.filter((item) => item.quadrant === "languages-and-frameworks")  }
    ]

    this.radarElement = d3.select(containerEl).append('div').attr('id', 'radar')

    var header = this.plotRadarHeader()
    this.plotQuadrantButtons(this.quadrants, header)

    this.svg = d3.select('#radar')
      .append('svg')
      .call(this.tip)
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
    const { svg, props: { data, width, height }, quadrants, rings } = this;

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
  }

  mouseoverQuadrant = (order) => {
    d3.select('.quadrant-group-' + order).style('opacity', 1)
    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 0.3)
  }

  mouseoutQuadrant = (order) => {
    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 1)
  }

  selectQuadrant = (order, startAngle) => {
    const { svg, toRadian, createHomeLink, drawLegend } = this;
    const size = this.props.height

    d3.selectAll('.home-link').classed('selected', false)
    createHomeLink(d3.select('header'))

    d3.selectAll('.button').classed('selected', false).classed('full-view', false)
    d3.selectAll('.button.' + order).classed('selected', true)
    d3.selectAll('.quadrant-table').classed('selected', false)
    d3.selectAll('.quadrant-table.' + order).classed('selected', true)
    d3.selectAll('.blip-item-description').classed('expanded', false)

    var scale = 2

    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle))
    var adjustY = Math.cos(toRadian(startAngle)) + Math.sin(toRadian(startAngle))

    var translateX = (-1 * (1 + adjustX) * size / 2 * (scale - 1)) + (-adjustX * (1 - scale / 2) * size)
    var translateY = (-1 * (1 - adjustY) * (size / 2 - 7) * (scale - 1)) - ((1 - adjustY) / 2 * (1 - scale / 2) * size)

    var translateXAll = (1 - adjustX) / 2 * size * scale / 2 + ((1 - adjustX) / 2 * (1 - scale / 2) * size)
    var translateYAll = (1 + adjustY) / 2 * size * scale / 2

    var moveRight = (1 + adjustX) * (0.8 * window.innerWidth - size) / 2
    var moveLeft = (1 - adjustX) * (0.8 * window.innerWidth - size) / 2

    var blipScale = 3 / 4
    var blipTranslate = (1 - blipScale) / blipScale

    svg.style('left', moveLeft + 'px').style('right', moveRight + 'px')
    d3.select('.quadrant-group-' + order)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'translate(' + translateX + ',' + translateY + ')scale(' + scale + ')')
    d3.selectAll('.quadrant-group-' + order + ' .blip-link text').each(function () {
      var x = d3.select(this).attr('x')
      var y = d3.select(this).attr('y')
      d3.select(this.parentNode)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('transform', 'scale(' + blipScale + ')translate(' + blipTranslate * x + ',' + blipTranslate * y + ')')
    })

    d3.selectAll('.quadrant-group')
      .style('pointer-events', 'auto')

    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')')
      .transition()
      .duration(ANIMATION_DURATION)
      .style('pointer-events', 'none')
      .attr('transform', 'translate(' + translateXAll + ',' + translateYAll + ')scale(0)')

    if (d3.select('.legend.legend-' + order).empty()) {
      drawLegend(order)
    }
  }

  drawLegend = (order) => {
    const { triangleLegend, circleLegend } = this;
    const size = this.props.height;

    this.removeRadarLegend()

    var triangleKey = 'New or moved'
    var circleKey = 'No change'

    var container = d3.select('svg').append('g')
      .attr('class', 'legend legend' + '-' + order)

    var x = 10
    var y = 10

    if (order === 'first') {
      x = 4 * size / 5
      y = 1 * size / 5
    }

    if (order === 'second') {
      x = 1 * size / 5 - 15
      y = 1 * size / 5 - 20
    }

    if (order === 'third') {
      x = 1 * size / 5 - 15
      y = 4 * size / 5 + 15
    }

    if (order === 'fourth') {
      x = 4 * size / 5
      y = 4 * size / 5
    }

    d3.select('.legend')
      .attr('class', 'legend legend-' + order)
      .transition()
      .style('visibility', 'visible')

    triangleLegend(x, y, container)

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 5)
      .attr('font-size', '0.8em')
      .text(triangleKey)

    circleLegend(x, y + 20, container)

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 25)
      .attr('font-size', '0.8em')
      .text(circleKey)
  }

  createHomeLink = (pageElement) => {
    const { redrawFullRadar } = this;
    if (pageElement.select('.home-link').empty()) {
      pageElement.insert('div', 'div#alternative-buttons')
        .html('&#171; Back to Radar home')
        .classed('home-link', true)
        .classed('selected', true)
        .on('click', redrawFullRadar)
        .append('g')
        .attr('fill', '#626F87')
        .append('path')
        .attr('d', 'M27.6904224,13.939279 C27.6904224,13.7179572 27.6039633,13.5456925 27.4314224,13.4230122 L18.9285959,6.85547454 C18.6819796,6.65886965 18.410898,6.65886965 18.115049,6.85547454 L9.90776939,13.4230122 C9.75999592,13.5456925 9.68592041,13.7179572 9.68592041,13.939279 L9.68592041,25.7825947 C9.68592041,25.979501 9.74761224,26.1391059 9.87092041,26.2620876 C9.99415306,26.3851446 10.1419265,26.4467108 10.3145429,26.4467108 L15.1946918,26.4467108 C15.391698,26.4467108 15.5518551,26.3851446 15.6751633,26.2620876 C15.7984714,26.1391059 15.8600878,25.979501 15.8600878,25.7825947 L15.8600878,18.5142424 L21.4794061,18.5142424 L21.4794061,25.7822933 C21.4794061,25.9792749 21.5410224,26.1391059 21.6643306,26.2620876 C21.7876388,26.3851446 21.9477959,26.4467108 22.1448776,26.4467108 L27.024951,26.4467108 C27.2220327,26.4467108 27.3821898,26.3851446 27.505498,26.2620876 C27.6288061,26.1391059 27.6904224,25.9792749 27.6904224,25.7822933 L27.6904224,13.939279 Z M18.4849735,0.0301425662 C21.0234,0.0301425662 23.4202449,0.515814664 25.6755082,1.48753564 C27.9308469,2.45887984 29.8899592,3.77497963 31.5538265,5.43523218 C33.2173918,7.09540937 34.5358755,9.05083299 35.5095796,11.3015031 C36.4829061,13.5518717 36.9699469,15.9439104 36.9699469,18.4774684 C36.9699469,20.1744196 36.748098,21.8101813 36.3044755,23.3844521 C35.860551,24.9584216 35.238498,26.4281731 34.4373347,27.7934053 C33.6362469,29.158336 32.6753041,30.4005112 31.5538265,31.5197047 C30.432349,32.6388982 29.1876388,33.5981853 27.8199224,34.3973401 C26.4519041,35.1968717 24.9791531,35.8176578 23.4016694,36.2606782 C21.8244878,36.7033971 20.1853878,36.9247943 18.4849735,36.9247943 C16.7841816,36.9247943 15.1453837,36.7033971 13.5679755,36.2606782 C11.9904918,35.8176578 10.5180429,35.1968717 9.15002449,34.3973401 C7.78223265,33.5978839 6.53752245,32.6388982 5.41612041,31.5197047 C4.29464286,30.4005112 3.33339796,29.158336 2.53253673,27.7934053 C1.73144898,26.4281731 1.10909388,24.9584216 0.665395918,23.3844521 C0.22184898,21.8101813 0,20.1744196 0,18.4774684 C0,16.7801405 0.22184898,15.1446802 0.665395918,13.5704847 C1.10909388,11.9962138 1.73144898,10.5267637 2.53253673,9.16153157 C3.33339796,7.79652546 4.29464286,6.55435031 5.41612041,5.43523218 C6.53752245,4.3160387 7.78223265,3.35675153 9.15002449,2.55752138 C10.5180429,1.75806517 11.9904918,1.13690224 13.5679755,0.694183299 C15.1453837,0.251464358 16.7841816,0.0301425662 18.4849735,0.0301425662 L18.4849735,0.0301425662 Z')
    }
  }

  removeHomeLink = () => {
    d3.select('.home-link').remove()
  }

  removeRadarLegend = () => {
    d3.select('.legend').remove()
  }

  redrawFullRadar = () => {
    this.removeHomeLink()
    this.removeRadarLegend()
    this.tip.hide()
    d3.selectAll('g.blip-link').attr('opacity', 1.0)

    this.svg.style('left', 0).style('right', 0)

    d3.selectAll('.button')
      .classed('selected', false)
      .classed('full-view', true)

    d3.selectAll('.quadrant-table').classed('selected', false)
    d3.selectAll('.home-link').classed('selected', false)

    d3.selectAll('.quadrant-group')
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'scale(1)')

    d3.selectAll('.quadrant-group .blip-link')
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', 'scale(1)')

    d3.selectAll('.quadrant-group')
      .style('pointer-events', 'auto')
  }

  plotQuadrant = (rings, quadrant) => {
    const { svg, ringCalculator, _center, toRadian } = this;
    var quadrantGroup = svg.append('g')
      .attr('class', 'quadrant-group quadrant-group-' + quadrant.order)
      .on('mouseover', this.mouseoverQuadrant.bind({}, quadrant.order))
      .on('mouseout', this.mouseoutQuadrant.bind({}, quadrant.order))
      .on('click', this.selectQuadrant.bind({}, quadrant.order, quadrant.startAngle))

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

  plotRadarHeader = () => {
    const { redrawFullRadar } = this;
    const header = d3.select(this.containerEl).insert('header', '#radar')
    header.append('div')
      .attr('class', 'radar-title')
      .append('div')
      .attr('class', 'radar-title__text')
      .append('h1')
      .text(document.title)
      .style('cursor', 'pointer')
      .on('click', redrawFullRadar)

    header.select('.radar-title')
      .append('div')
      .attr('class', 'radar-title__logo')
      .html('<a href="https://granulate.io"> <img src="/images/logo.png" /> </a>')

    this.buttonsGroup = header.append('div')
      .classed('buttons-group', true)

    this.quadrantButtons = this.buttonsGroup.append('div')
      .classed('quadrant-btn--group', true)

    // alternativeDiv = header.append('div')
    //   .attr('id', 'alternative-buttons')

    return header
  }

  plotQuadrantButtons = (quadrants, header) => {
    const { mouseoverQuadrant, mouseoutQuadrant, selectQuadrant } = this;

    quadrants.map((quadrant) => {
      this.radarElement
        .append('div')
        .attr('class', 'quadrant-table ' + quadrant.order)

      this.quadrantButtons.append('div')
        .attr('class', 'button ' + quadrant.order + ' full-view')
        .text(quadrant.name)
        .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
        .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
        .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle))
    })

    this.buttonsGroup.append('div')
      .classed('print-radar-btn', true)
      .append('div')
      .classed('print-radar button no-capitalize', true)
      .text('Print this radar')
      .on('click', window.print.bind(window))

    // alternativeDiv.append('div')
    //   .classed('search-box', true)
    //   .append('input')
    //   .attr('id', 'auto-complete')
    //   .attr('placeholder', 'Search')
    //   .classed('search-radar', true)

    // AutoComplete('#auto-complete', quadrants, searchBlip)
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

  triangleLegend = (x, y, group) => {
    return group.append('path').attr('d', 'M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406')
      .attr('transform', 'scale(' + (22 / 64) + ') translate(' + (-404 + x * (64 / 22) - 17) + ', ' + (-282 + y * (64 / 22) - 17) + ')')
  }

  circle = (blip, x, y, order, group) => {
    const { svg } = this;
    return (group || svg).append('path')
      .attr('d', 'M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092')
      .attr('transform', 'scale(' + (blip.width / 34) + ') translate(' + (-404 + x * (34 / blip.width) - 17) + ', ' + (-282 + y * (34 / blip.width) - 17) + ')')
      .attr('class', order)
  }

  circleLegend = (x, y, group) => {
    const { svg } = this;
    return (group || svg).append('path')
      .attr('d', 'M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092')
      .attr('transform', 'scale(' + (22 / 64) + ') translate(' + (-404 + x * (64 / 22) - 17) + ', ' + (-282 + y * (64 / 22) - 17) + ')')
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
      .text('')

    var blipListItem = ringList.append('li')
    var blipText = blip.id + '. ' + blip.name + (blip.topic ? ('. - ' + blip.topic) : '')
    blipListItem.append('div')
      .attr('class', 'blip-list-item')
      .attr('id', 'blip-list-item-' + blip.id)
      .text(blipText)

    var blipItemDescription = blipListItem.append('div')
      .attr('id', 'blip-description-' + blip.id)
      .attr('class', 'blip-item-description')
    if (blip.description) {
      blipItemDescription.append('p').html(blip.description)
    }

    var mouseOver = () => {
      d3.selectAll('g.blip-link').attr('opacity', 0.3)
      group.attr('opacity', 1.0)
      blipListItem.selectAll('.blip-list-item').classed('highlight', true)
      this.tip.show(blip.name, group.node())
    }

    var mouseOut = () => {
      d3.selectAll('g.blip-link').attr('opacity', 1.0)
      blipListItem.selectAll('.blip-list-item').classed('highlight', false)
      this.tip.hide().style('left', 0).style('top', 0)
    }

    blipListItem.on('mouseover', mouseOver).on('mouseout', mouseOut)
    group.on('mouseover', mouseOver).on('mouseout', mouseOut)

    var clickBlip = () => {
      d3.select('.blip-item-description.expanded').node() !== blipItemDescription.node() &&
        d3.select('.blip-item-description.expanded').classed('expanded', false)
      blipItemDescription.classed('expanded', !blipItemDescription.classed('expanded'))

      blipItemDescription.on('click', function () {
        d3.event.stopPropagation()
      })
    }

    blipListItem.on('click', clickBlip)
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
