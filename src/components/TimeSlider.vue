<template>
<v-container class="container">
  <!-- hide on small devices smaller than 600px -->
  <v-row no-gutters class="hidden-xs-only" v-show="timeMode && timeMode.showLanes">
    <v-col cols="12">
      <v-card flat color="transparent">
        <div id="slider">
          <svg :height="sliderHeight" :width="sliderWidth + labelWidth"></svg>
        </div>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="auto">
      <v-btn text @click="changeMode" v-if="timeMode">
        {{ timeMode.name }}
      </v-btn>
    </v-col>
    <v-col cols="auto"  v-if="timeMode">
      <v-btn
        text
        v-show="timeMode.showPlayer"
        @click="play()"
        v-if="state === 'PAUSED'"
        >
        <v-icon small>fa-play</v-icon>
      </v-btn>
      <v-btn
        text
        v-show="timeMode.showPlayer"
        v-if="state === 'PLAYING'"
        @click="pause()"
        >
        <v-icon  small>fa-pause</v-icon>
      </v-btn>
      <v-btn
        text
        v-if="state === 'PAUSED' && timeMode.showBackForward"
        @click="backward()"
        >
        <v-icon  small>fa-step-backward</v-icon>
      </v-btn>
      <v-btn
        text
        v-if="state === 'PAUSED' && timeMode.showBackForward"
        @click="forward()"
        >
        <v-icon  small>fa-step-forward</v-icon>
      </v-btn>

      <v-btn
        text
        v-show="timeMode.showPlayer"
        v-model="loop"
        @click="loop = !loop"
        >
        <v-icon>fa-redo-alt</v-icon>
      </v-btn>
      <v-btn text
             @click="changeSpeed"
             v-show="timeMode.showPlayer"
             v-if="speed" >
        {{ speed.name }}
      </v-btn>
    </v-col>
    <v-spacer></v-spacer>
    <v-col cols="auto">
      {{ currentTimeMessage }}
    </v-col>
  </v-row>
</v-container>
</template>
<script>
import moment from "moment";
import * as d3 from "d3";

import {force} from './collision'

const speeds = [
  {
    value: 50000,
    name: 'LANGZAAM'
  },
  {
    name: 'NORMAAL',
    value: 10000
  },
  {
    value: 5000,
    name: 'SNEL'
  }
]

export default {
  name: "time-slider",
  props: {
    timeModes: {
      type: Array,
      required: true
    },
    dates: {
      type: Array
    },
    step: {
      type: Object
    }
  },
  data() {
    return {
      state: 'PAUSED',
      // set in updateLaneGroup
      timeGrid: [],
      dataLanes: null,
      loop: true,
      labelWidth: 150,
      laneHeight: 20,
      laneSpacing: 0,
      margin: {},
      timeMode: null,
      periodHeight: 20,
      svg: null,
      nTicks: 0,
      showPlay: true,
      maxFps: 10,
      slider: null,
      sliderWidth: 0,
      sliderHeight: 0,
      svgWidth: 0,
      trackHeight: 30,
      dragging: false,
      speeds: speeds,
      speed: null,
      layers: [{
        name: 'Satelliet beelden'
      }]
    }
  },
  watch: {
    step: {
      handler() {
        this.redraw()
        this.updateImages()
      }
    },
    dates: {
      handler() {
        this.redraw()
      }
    },
    timeMode: {
      handler: function (timeMode) {
        // if current time is outside of current extent
        let outside = (this.step <= timeMode.extent[0]) || (this.step >= timeMode.extent[1])
        if (outside) {
          this.$emit('update:step', timeMode.extent[1].clone().add(-1, this.timeMode.interval))
        }
        this.redraw()
      }
    },
    timeModes: {
      handler (timeModes) {
        if (!timeModes.length) {
          return
        }
        let timeMode = timeModes[0]
        this.timeMode = timeMode
        this.redraw()
      }
    }
  },
  computed: {
    currentTimeMessage() {
      let from = "{from}";
      let to = "{to}";
      if (this.step && this.timeMode) {
        from = moment(this.step).format(this.timeMode.momentFormat);
        to = moment(this.step)
          .add(1, this.timeMode.interval)
          .format(this.timeMode.momentFormat);
      }

      let time = ''
      if(this.timeMode) {
        time = this.timeMode.name.toLowerCase()
      }
      let message = `Huidige beeld: ${time}kaart ${from}`
      return message;
    }
  },
  mounted() {
    // Set the current mode (yearly or daily according to the selected route)
    let timeMode = this.timeModes[0]
    this.timeMode = timeMode

    let speed = this.speeds[2]
    this.speed = speed

    // Update the margins and scale
    if (this.timeMode) {
      this.$nextTick(() => {
        this.changeMargin();
        this.updateScale();
      })
    }

    // Create the svg OBJECTID
    this.svg = d3.select("#slider svg")

    this.createLaneGroup();
    this.updateLaneGroup();
    this.createSlider();
    // this.createCurrentPeriod()
    this.redraw();
    window.addEventListener("resize", () => {
      this.redraw();
    });
    this.$emit('update:time-mode', timeMode)



  },
  methods: {
    changeSpeed() {
      this.speed = this.getNextElementInArray(
        this.speeds,
        this.speed
      );
    },
    changeMode() {
      this.timeMode = this.getNextElementInArray(
        this.timeModes,
        this.timeMode
      )
      this.$emit('update:time-mode', this.timeMode)
      this.redraw()

    },
    getNextElementInArray(array, selected) {
      // return next element in array
      // find current element
      const ind = array.indexOf(selected);
      // we're at the end or could not find it
      if (ind === array.length - 1 || ind === -1) {
        selected = array[0];
      } else if (array.length !== 1) {
        selected = array[ind + 1];
      }
      return selected;
    },
    changeMargin() {
      var nLanes = this.layers.length;
      this.svgWidth = this.$el.clientWidth - 20;
      this.margin = 10;
      this.sliderWidth = this.svgWidth - this.labelWidth - 2 * this.margin;
      this.sliderHeight = this.trackHeight + this.laneHeight + this.periodHeight + this.margin
      const nt = parseInt(this.sliderWidth / 60)
      this.nTicks = nt > this.timeMode.ticks ? this.timeMode.ticks : nt
    },

    updateScale() {
      this.xScale = d3
        .scaleTime()
        .domain(this.timeMode.extent)
        .range([0, this.sliderWidth]);
    },

    createSlider() {
      this.slider = this.svg.append("g").attr("class", "slider");
    },
    updateSlider() {
      this.slider.attr(
        "transform",
        `translate(${this.labelWidth}, ${this.trackHeight})`
      );

      this.slider.selectAll("*").remove();

      let drag = d3
          .drag()

      drag
        .on("start.interrupt", () => {
          this.slider.interrupt()
        })
        .on("start drag", () => {
          this.pause()
          this.dragging = true;
          let date = this.xScale.invert(d3.event.x)
          this.$emit('update:step', moment(date).startOf(
            this.timeMode.interval
          ))
          if (
            this.step <= this.timeMode.extent[0] ||
              this.step >= this.timeMode.extent[1]
          ) {
            this.slider.interrupt();
            this.handle.classed('dragging', false)
            this.lanePeriod.classed('dragging', false)
            return null
          }
          this.handle.classed('dragging', true)
          this.lanePeriod.classed('dragging', true)
          this.updateHandle()
        })
        .on("end", () => {
          this.dragging = false

          this.lanePeriod.classed('dragging', false)
          this.handle.classed('dragging', false)
        })


      let track = this.slider
          .append("line")
          .attr("class", "track")
          .attr("x1", this.xScale.range()[0])
          .attr("x2", this.xScale.range()[1])
          .attr("y1", 0)
          .attr("y2", 0)

      // create a copy
      track
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")

      // and another copy
      track
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(drag)

      // ticks
      this.slider
        .insert("g", ".track-overlay")
        .attr("class", "track-lines")
        .selectAll("line")
        .data(this.xScale.ticks(this.nTicks))
        .enter()
        .append("line")
        .attr("x1", this.xScale)
        .attr("x2", this.xScale)
        .attr("y1", 0)
        .attr("y2", 10)

      // tick labels
      this.slider
        .insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(this.xScale.ticks(this.nTicks))
        .enter()
        .append("text")
        .attr("x", this.xScale)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(d => this.formatDate(d));


      let currentStep = moment(this.step)
      let nextStep = currentStep
          .clone()
          .add(1, this.timeMode.interval)
      let width = this.xScale(nextStep) - this.xScale(currentStep)


      this.lanePeriod = this.slider
        .insert("rect")
        .attr("class", "lane-rect")
        .attr("y", - this.layers.length * (this.laneHeight + this.laneSpacing))
        .attr(
          "height",
          this.layers.length * (this.laneHeight + this.laneSpacing)
        )
        .attr("width", width)
        .attr("fill", "rgba(0, 0, 0, 0.2)")
        .call(drag)

      this.handle = this.slider
        .insert("circle")
        .attr("class", "track-overlay")
        .attr("class", "handle")
        .attr("id", "handle")
        .attr("r", 6)
        .call(drag);
    },
    createLaneGroup() {
      this.laneGroup = this.svg.append("g").attr("z-index", 0);
    },
    updateLaneGroup() {

      // reset the timeGrid
      // TODO: move this out of this function
      this.timeGrid = []

      this.laneGroup
        .attr("height", this.trackHeight)
        .attr("width", this.sliderWidth)
        .attr(
          "transform",
          `translate(0, ${this.trackHeight -
            this.layers.length * this.laneHeight})`
        );

      var yScale = d3
          .scaleLinear()
          .domain([0, this.layers.length])
          .range([0, this.layers.length * (this.laneHeight + this.laneSpacing)]);

      this.laneGroup.selectAll("*").remove();

      var fontsize = 7;
      var margin = 4;
      this.layers.forEach((data, index) => {
        const dataLane = this.laneGroup
              .append("g")
              .attr("class", "data-lane")
              .attr("height", this.laneHeight)
              .attr("x", this.labelWidth)
              .attr("width", this.sliderWidth);

        // Add the label of dataset for each dadalane
        dataLane
          .append("text")
          .attr("class", "lane-label")
          .attr("text-anchor", "left")
          .text(data.name)
          .attr("y", (index + 1) * this.laneHeight - fontsize)
          .attr("font-size", `${fontsize * 2}px`)
          .attr("font-family", "'Avenir', Helvetica, Arial, sans-serif");

        // Append line below datalane
        dataLane
          .append("line")
          .attr("x1", this.labelWidth)
          .attr("x2", this.sliderWidth + this.labelWidth)
          .attr("y1", yScale(index) - this.laneSpacing / 2)
          .attr("y2", yScale(index) - this.laneSpacing / 2)
          .attr("stroke", "rgb(21,66,115)");


        if (this.timeMode.name === "JAAR") {
          let yearData = this.dates.filter(
            x =>
              x.type === "interval" &&
              moment(x.dateStart) >= this.timeMode.extent[0] &&
              moment(x.dateEnd) <= this.timeMode.extent[1]
          )
          if (yearData.length === 0) {
            return
          }

          // add some relevant data
          yearData = yearData.map(d => {

            let startDate = moment(d.dateStart, d.dateFormat)
            let id = startDate.format("DD-MM-YYYY")

            let x = this.xScale(startDate) + this.labelWidth

            let height = this.laneSpacing / 2
            let y = yScale(index) - height + margin / 2

            let xEnd = this.xScale(moment(d.dateEnd, d.dateFormat))
            let xStart = this.xScale(moment(d.dateStart, d.dateFormat))
            let width = xEnd - xStart
            let origin = [x + 0.5 * width, y + 0.5 * (this.laneHeight - margin)]
            let transformOrigin = `${origin[0]}px ${origin[1]}px`

            // return all the new variables
            return {
              ...d,
              id,
              x,
              y,
              width,
              height,
              origin,
              transformOrigin
            }

          })

          dataLane
            .append("g")
            .classed('intervals', true)
            .selectAll("rect")
            .data(yearData)
            .enter()
            .append("rect")
            .attr("id", d => d.id)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("id", d => d.id)
            .attr("width", d => d.width)
            .attr("height", this.laneHeight - margin)
            .style('transform-origin', d => d.transformOrigin)
            .on("click", x => {
              this.$emit('update:step', moment(x.dateStart, x.dateFormat))
              // this.$emit('select:interval', x)

              this.redraw()
            });
        }
        if (this.timeMode.name === "DAG") {
          let instanceDates = this.dates.filter(
            x =>
              x.type === "instance" &&
              moment(x.date, x.dateFormat) >= this.timeMode.extent[0] &&
              moment(x.date, x.dateFormat) <= this.timeMode.extent[1]
          )
          if (instanceDates.length === 0) {
            return
          }

          // store instanceDates so we can use them to  snap
          // remember the last one
          // TODO: move this out of the timeSlider
          this.timeGrid = instanceDates.map((d) => {
            let t = moment(d.date, d.dateFormat)
            return t
          })

          dataLane
            .append("g")
            .selectAll(".dataInstances")
            .data(instanceDates)
            .enter()
            .append("rect")
            .attr("class", "rect-instance")
            .attr("id", x => moment(x.date, x.dateFormat).format("DD-MM-YYYY"))
            .attr(
              "x",
              x => this.xScale(moment(x.date, x.dateFormat)) + this.labelWidth
            )
            .attr("y", yScale(index) - this.laneSpacing / 2 + margin / 2)
            .attr("ry", 2)
            .attr("rx", 2)
            .attr("width", 2)
            .attr("height", this.laneHeight - margin)
            .on("click", x => {
              this.$emit('update:step', moment(x.date, x.dateFormat))
              // this.$emit('select:instance', x)

              this.redraw();
            });
        }
      });
    },
    play() {
      this.state = 'PLAYING'
      this.dragging = true

      let playLoop = (now) => {
        this.timer = requestAnimationFrame(playLoop)
        // first update, when this.last is still null, set value and return
        if (!this.last) {
          this.last = now
          return
        }

        // now we can just return if we are not playing (will result in a regular poll for playing)
        if (this.state !== 'PLAYING') {
          this.dragging = false
          return
        }

        // elapsed time in seconds
        const elapsed = (now - this.last) / this.speed.value;
        // seconds per frame did not elapse, we're done
        if (elapsed < 1 / this.maxFps) {
          // this keeps the number of events low (otherwise you get 60 events per second)
          return
        }

        const nextStep = moment(this.step).add(1, this.timeMode.interval);

        if (nextStep >= this.timeMode.extent[1]) {
          if (this.loop) {
            this.$emit('update:step', this.timeMode.extent[0])
          } else {
            this.state = 'PAUSED'
            return
          }
        } else {
          this.$emit('update:step', nextStep)
        }
        this.updateHandle()
        this.last = now

      }
      playLoop()

    },
    pause() {
      this.state = 'PAUSED'
    },
    backward () {
      // step back  in time
      const nextStep = moment(this.step).add(-1, this.timeMode.interval);
      if (nextStep < this.timeMode.extent[0]) {
        return
      } else {
        this.$emit('update:step', nextStep)
      }
      this.snap(false)

      this.redraw()

    },
    forward () {
      // step forward in time
      const nextStep = moment(this.step).add(1, this.timeMode.interval);
      if (nextStep >= this.timeMode.extent[1]) {
        return
      } else {
        this.$emit('update:step', nextStep)
      }
      this.snap(true)
      this.redraw()

    },
    snap(forward) {
      if (!this.timeGrid.length) {
        return
      }
      let snapCandidates = this.timeGrid.filter(

        t => {
          if (!forward) {
            return t.isSameOrBefore(this.step)
          } else {
            return t.isAfter(this.step)
          }
        }
      )
      if (!snapCandidates.length) {
        return
      }
      // sort in place
      snapCandidates.sort((a, b) => a.isSameOrBefore(b) ? -1 : 1)

      if (forward) {
        snapCandidates.reverse()
      }

      // get the last
      let snapCandidate = snapCandidates[snapCandidates.length - 1]


      // if it's outside the extent never mind
      if (snapCandidate.isBefore(this.timeMode.extent[0]) || snapCandidate.isAfter(this.timeMode.extent[1])) {
        return
      }

      this.$emit('update:step', snapCandidate)

    },
    updateHandle() {
      this.handleLocationRounded = this.xScale(
        moment(this.step).startOf(this.timeMode.interval)
      );
      this.handle.attr("cx", this.handleLocationRounded);
      this.lanePeriod.attr("x", this.handleLocationRounded);
    },

    formatDate(d) {
      var timeFormat = d3.timeFormat(this.timeMode.format);
      return timeFormat(d);
    },

    redraw() {
      if (!this.timeMode) {
        return;
      }
      this.changeMargin()
      this.updateScale()

      this.svg.attr("width", this.svgWidth)
      this.updateLaneGroup()
      this.updateSlider()
      this.updateHandle()
    },

    updateImages() {
      this.$emit("update:timeslider", {
        dragging: this.dragging,
        beginDate: moment(this.step).format('YYYY-MM-DD'),
        endDate: moment(this.step).add(1, this.timeMode.interval).format('YYYY-MM-DD'),
        timing: this.timeMode.name
      });
    }
  }
};
</script>

<style scoped>
#slider {
  /* padding: 50px; */
  width: calc(100% - 20px);
  height: 70px;
}
/* scoped styles do not descent into d3, so use outer element */
svg >>> .ticks {
  user-select: none;
}

svg >>> .track,
svg >>> .track-inset,
svg >>> .track-overlay {
  stroke-linecap: round;
}

svg >>> .track-inset {
  stroke: rgb(21, 66, 115);
  stroke-width: 3px;
  stroke-linecap: round;
}

svg >>> .track-lines {
  stroke: rgb(21, 66, 115);
  stroke-width: 1px;
  stroke-linecap: round;
}

svg >>> .track-overlay {
  pointer-events: stroke;
  stroke-width: 8px;
  stroke: transparent;
  cursor: pointer;
}

svg >>> .data-lane {
  user-select: none;

}

svg >>> .handle {
  fill: #fff;
  stroke: #000;
  stroke-opacity: 0.5;
  stroke-width: 1.25px;
  transition: 0.5s stroke-width;
}
svg >>> .handle.dragging {
  stroke-width: 3px;
}
svg >>> .lane-rect {
  stroke: #000;
  stroke-opacity: 0.5;
  stroke-width: 1.25px;
  cursor: grab;
  transition: 0.5s stroke-width;
}

svg >>> .lane-rect.dragging {
  stroke-width: 3px;

}



svg >>> .rect {
  margin: 2px;
}
svg >>> .rect-instance:hover {
  fill: red;
}

svg >>> .intervals rect {
  stroke: #000;
  stroke-width: 1.25px;
  fill-opacity: 0.2;
  cursor: pointer;
  transform: scale(0.8);
}
svg >>> .intervals rect:hover {
  transform: scale(1);
  transition: 0.5s transform;
}


</style>
