<template>
  <v-container fill-height row>
    <!-- call play function so timer gets updated -->
    <v-col md="1">
      <v-flex>
        <v-btn
          text
          v-model="state"
          @click="
            state = !state
            play()
          "
        >
          <v-icon v-if="state" small>fa-pause</v-icon>
          <v-icon v-if="!state" small>fa-play</v-icon>
        </v-btn>
        <v-btn text v-model="loop" @click="loop = !loop">
          <v-icon>fa-redo-alt</v-icon>
        </v-btn>
        <v-btn text @click="changeMode">
          {{ currentSliderMode }}
        </v-btn>
      </v-flex>
    </v-col>
    <v-col md="11">
      <div id="slider"></div>
    </v-col>
  </v-container>
</template>

<script>
import moment from 'moment'
import * as d3 from 'd3'

export default {
  name: 'time-slider',
  props: {
    layers: {
      type: Array
    },
    modes: {
      type: Array
    }
  },
  data() {
    return {
      state: false,
      step: moment('1990'),
      dataLanes: null,
      loop: false,
      labelWidth: 150,
      laneHeight: 20,
      laneSpacing: 0,
      margin: {},
      timeModes: [
        {
          name: 'JAAR',
          format: '%Y',
          interval: 'year',
          extent: [moment('1984'), moment()]
        },
        {
          name: 'DAG',
          format: '%-m-%Y',
          interval: 'day',
          extent: [moment().subtract(1, 'year'), moment()]
        }
      ],
      periodHeight: 20,
      svg: null,
      mode: {},
      nTicks: 0,
      showPlay: true,
      maxFps: 10,
      slider: null,
      sliderWidth: 0,
      sliderHeight: 0,
      svgWidth: 0,
      trackHeight: 70,
      currentTime: '01-01-2009',
      GEELayerType: 'image',
      currentSliderMode: 'JAAR',
      handleLocationRounded: '',
      dragging: false
    }
  },
  watch: {
    $route(val) {
      const mode = this.modes.find(mode => mode.name === val.name)
      this.sliderModes = mode.timeModes.map(mode => mode.mode)
      this.GEELayerType = mode.type
      this.changeMode()
    },
    layers() {
      if (!this.layers) return
      this.redraw()
    },
    handleLocationRounded() {
      this.$emit('update-timeslider', {
        dragging: this.dragging,
        beginDate: moment(this.step),
        endDate: moment(this.step).add(1, this.mode.interval),
        GEELayerType: this.GEELayerType
      })
    }
  },
  mounted() {
    // Set the current mode (yearly or daily according to the selected route)
    const mode = this.modes.find(mode => mode.name === this.$route.name)
    this.sliderModes = mode.timeModes.map(mode => mode.mode)
    this.mode = this.timeModes[0]

    // Create the svg OBJECTID
    this.svg = d3.select('#slider').append('svg')

    // Update the margins and scale
    this.changeMargin()
    this.updateScale()

    this.svg
      .attr('width', this.sliderWidth + this.labelWidth)
      .attr('height', this.sliderHeight)

    this.createSlider()
    this.createDataLanes()

    this.createCurrentPeriod()
    this.redraw()
    window.addEventListener('resize', () => {
      this.redraw()
    })
  },
  methods: {
    changeMode() {
      const ind = this.sliderModes.indexOf(this.currentSliderMode)
      if (ind === this.sliderModes.length - 1 || ind === -1) {
        this.currentSliderMode = this.sliderModes[0]
      } else if (this.sliderModes.length !== 1) {
        this.currentSliderMode = this.sliderModes[ind + 1]
        this.mode = this.timeModes.find(
          mode => mode.name === this.currentSliderMode
        )
        this.updateScale()
        this.updateSlider()
      }
    },
    changeMargin() {
      var nLanes = this.layers.length
      this.sliderWidth =
        document.querySelector('#t-slider > div > div.col-md-11.col')
          .clientWidth - this.labelWidth
      this.sliderHeight =
        this.trackHeight + this.laneHeight * nLanes + this.periodHeight
      this.nTicks = parseInt(this.sliderWidth / 40)
    },

    updateScale() {
      this.xScale = d3
        .scaleTime()
        .domain(this.mode.extent)
        .range([0, this.sliderWidth])
    },

    createSlider() {
      this.slider = this.svg.append('g').attr('class', 'slider')
    },
    createCurrentPeriod() {
      this.currentPeriod = this.svg
        .append('text')
        .attr('class', 'current-period')
        .attr(
          'text',
          `${moment(this.step).format('DD/MM/YYYY')} - ${moment(this.step)
            .add(1, this.mode.interval)
            .format('DD/MM/YYYY')} `
        )
        .attr('x', this.sliderWidth / 2 + this.labelWidth)
        .attr('text-anchor', 'middle')
    },
    updateSlider() {
      this.slider.attr(
        'transform',
        `translate(${this.labelWidth}, ${this.trackHeight})`
      )

      this.slider.selectAll('*').remove()
      this.slider
        .append('line')
        .attr('class', 'track')
        .attr('x1', this.xScale.range()[0])
        .attr('x2', this.xScale.range()[1])
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true))
        })
        .attr('class', 'track-inset')
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true))
        })
        .attr('class', 'track-overlay')
        .call(
          d3
            .drag()
            .on('start.interrupt', () => {
              this.slider.interrupt()
            })
            .on('start drag', () => {
              this.dragging = true
              this.step = this.xScale.invert(d3.event.x)
              if (
                this.step <= this.mode.extent[0] ||
                this.step >= this.mode.extent[1]
              ) {
                this.slider.interrupt()
                this.handle.attr('r', 6)
                return null
              }
              this.handle.attr('r', 9)
              this.updateHandle()
            })
            .on('end', () => {
              this.dragging = false
              this.$emit('update-timeslider', {
                dragging: this.dragging,
                beginDate: moment(this.step),
                endDate: moment(this.step).add(1, this.mode.interval),
                GEELayerType: this.GEELayerType
              })
              this.handle.attr('r', 6)
            })
        )

      this.slider
        .insert('g', '.track-overlay')
        .attr('class', 'track-lines')
        .selectAll('line')
        .data(this.xScale.ticks(this.nTicks))
        .enter()
        .append('line')
        .attr('x1', this.xScale)
        .attr('x2', this.xScale)
        .attr('y1', 0)
        .attr('y2', 10)

      this.slider
        .insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .attr('transform', 'translate(0,' + 18 + ')')
        .selectAll('text')
        .data(this.xScale.ticks(this.nTicks))
        .enter()
        .append('text')
        .attr('x', this.xScale)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .text(d => this.formatDate(d))

      this.handle = this.slider
        .insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('id', 'handle')
        .attr('r', 6)
    },
    createDataLanes() {
      this.dataLanes = this.svg
        .append('g')
        .attr('transform', `translate(${this.labelWidth}, 0)`)
        .attr('class', 'layers')
        .attr('width', this.sliderWidth)
        .attr(
          'height',
          this.layers.length * (this.laneHeight + this.laneSpacing)
        )

      var nextStep = moment(this.step).clone()

      this.lanePeriod = this.dataLanes
        .append('rect')
        .attr('class', 'lane-rect')
        .attr(
          'height',
          this.layers.length * (this.laneHeight + this.laneSpacing)
        )
        .attr(
          'width',
          this.xScale(nextStep.add(1, this.mode.interval)) -
            this.xScale(this.step)
        )
        .attr('fill', 'rgba(0, 0, 0, 0.2)')
    },

    updateDataLanes() {
      var y = d3
        .scaleLinear()
        .domain([0, this.layers.length])
        .range([0, this.layers.length * (this.laneHeight + this.laneSpacing)])

      this.dataLanes
        .attr('width', this.sliderWidth)
        .attr(
          'height',
          this.layers.length * (this.laneHeight + this.laneSpacing)
        )
      this.dataLanes.selectAll('*').remove()

      this.dataLanes = this.svg
        .append('g')
        .attr('transform', `translate(${this.labelWidth}, 0)`)
        .attr('class', 'layers')

      var fontsize = 7
      var margin = 4

      this.layers.forEach((data, index) => {
        this.dataLanes
          .append('text')
          .attr('class', 'lane-label')
          .attr('text-anchor', 'left')
          .text(data.name)
          .attr('font-size', `${fontsize * 2}px`)
          .attr(
            'transform',
            `translate(${-this.labelWidth}, ${y(index) -
              this.laneSpacing / 2 +
              this.laneHeight / 2 +
              fontsize / 2} )`
          )

        this.dataLanes
          .append('rect')
          .attr('x', this.xScale.range()[0])
          .attr('y', y(index) - this.laneSpacing / 2)
          .attr('width', this.sliderWidth)
          .attr('height', this.laneHeight)
          .attr('ry', 5)
          .attr('rx', 5)
          .attr('fill', '#F0F0F0')
          .attr('stroke', 'rgb(21,66,115)')
          .attr('stroke-width', 1)

        this.dataLanes
          .append('g')
          .selectAll('.dataIntervals')
          .data(data.dates.filter(x => x.type === 'interval'))
          .enter()
          .append('rect')
          .attr('class', d => d.id)
          .attr('x', d => this.xScale(moment(d.start)))
          .attr('y', y(index) - this.laneSpacing / 2 + margin / 2)
          .attr('ry', 5)
          .attr('rx', 5)
          .attr(
            'width',
            d => this.xScale(moment(d.end)) - this.xScale(moment(d.start))
          )
          .attr('height', this.laneHeight - margin)

        this.dataLanes
          .append('g')
          .selectAll('.dataInstances')
          .data(data.dates.filter(x => x.type === 'instance'))
          .enter()
          .append('rect')
          .attr('class', 'rect-instance')
          .attr('id', d => d.id)
          .attr('x', d => this.xScale(moment(d.time)))
          .attr('y', y(index) - this.laneSpacing / 2 + margin / 2)
          .attr('ry', 5)
          .attr('rx', 5)
          .attr('width', 2)
          .attr('height', this.laneHeight - margin)
          .on('click', d => {
            this.step = moment(d.time)
            this.updateSlider()
          })
      })

      var nextStep = moment(this.step).clone()

      this.lanePeriod = this.dataLanes
        .append('rect')
        .attr('class', 'lane-rect')
        .attr(
          'height',
          this.layers.length * (this.laneHeight + this.laneSpacing)
        )
        .attr(
          'width',
          this.xScale(nextStep.add(1, this.mode.interval)) -
            this.xScale(this.step)
        )
        .attr('fill', 'rgba(0, 0, 0, 0.2)')
    },
    play(now) {
      this.timer = requestAnimationFrame(this.play)

      // first update, when this.last is still null, set value and return
      if (!this.last) {
        this.last = now
        return
      }

      // now we can just return if we are not playing (will result in a regular poll for playing)
      if (!this.state) {
        return
      }
      // elapsed time in seconds
      const elapsed = (now - this.last) / 1000
      // seconds per frame did not elapse, we're done
      if (elapsed < 1 / this.maxFps) {
        // this keeps the number of events low (otherwise you get 60 events per second)
        return
      }

      this.step = moment(this.step).add(1, this.mode.interval)
      if (this.step > this.mode.extent[1]) {
        if (this.loop) {
          this.step = this.mode.extent[0]
        } else {
          return
        }
      }
      this.updateHandle()
      this.last = now
    },

    updateHandle() {
      const handleLocationRounded = this.xScale(
        moment(this.step).startOf(this.mode.interval)
      )
      if (this.handleLocationRounded === handleLocationRounded) return
      this.handleLocationRounded = handleLocationRounded
      this.handle.attr('cx', handleLocationRounded)
      this.lanePeriod.attr('x', handleLocationRounded)
      this.currentPeriod.attr(
        'text',
        `${moment(this.step).format('DD/MM/YYYY')} - ${moment(this.step)
          .add(1, this.mode.interval)
          .format('DD/MM/YYYY')} `
      )
    },

    formatDate(d) {
      var timeFormat = d3.timeFormat(this.mode.format)
      return timeFormat(d)
    },
    deferredMountedTo(map) {
      console.log(map)
    },

    redraw() {
      this.changeMargin()
      this.updateScale()

      this.svg.attr('width', this.sliderWidth + this.labelWidth)
      // .attr("height", this.sliderHeight)

      this.updateDataLanes()
      this.updateSlider()
      this.updateHandle()
    }
  }
}
</script>

<style>
@import '~ion-rangeslider/css/ion.rangeSlider.css';
@import '~ion-rangeslider/css/ion.rangeSlider.skinModern.css';
#slider {
  /* padding: 50px; */
  width: 100%;
  height: 100px;
}

.track,
.track-inset,
.track-overlay {
  stroke-linecap: round;
}

.track-inset {
  stroke: rgb(21, 66, 115);
  stroke-width: 3px;
  stroke-linecap: round;
}

.track-lines {
  stroke: rgb(21, 66, 115);
  stroke-width: 1px;
  stroke-linecap: round;
}

.track-overlay {
  pointer-events: stroke;
  stroke-width: 50px;
  stroke: transparent;
  cursor: pointer;
}

.handle {
  fill: #fff;
  stroke: #000;
  stroke-opacity: 0.5;
  stroke-width: 1.25px;
  transition: 0.5s r;
}

.rect-instance:hover {
  fill: red;
}

.lane-rect {
  cursor: grab;
}
</style>
