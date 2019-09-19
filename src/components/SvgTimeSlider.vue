<template>
<v-container>
  <v-row>
    <v-col cols="12">
      <div>
        <svg :width="slider.width + 2*slider.margin" :height="slider.height + 2*slider.margin">
          <!-- <g> -->
            <!--   <\!-- embed custom charts -\-> -->
              <!--   <foreignObject x="0" y="0" width="200" height="20"> -->
                <!--     <body xmlns="http://www.w3.org/1999/xhtml"> -->
                  <!--       <slot></slot> -->
                  <!--     </body> -->
                <!--   </foreignObject> -->
              <!-- </g> -->
          <g class="axes" :transform="`translate(${slider.margin}, ${slider.margin})`">
            <g class="x">
              <g class="ticks"></g>
              <g class="ticks-label"></g>
            </g>
          </g>
          <g class="frame">
            <rect :x="slider.margin" :y="slider.margin" :width="slider.width" :height="slider.height"></rect>
          </g>
          <g :class="{handle: true, dragging: handle.dragging}">
            <rect :x="handle.x" :y="slider.margin" :width="handle.width" :height="handle.height"></rect>
          </g>
        </svg>
      </div>
      <v-row align="center">
        <v-col cols="2">
          <v-btn @click="state='PAUSED'" v-if="state === 'PLAYING'" >
            <v-icon small>fa-pause</v-icon>
          </v-btn>
          <v-btn @click="state='PLAYING'" v-else>
            <v-icon small>fa-play</v-icon>
          </v-btn>
          <v-btn
            v-model="loop"

            @click="loop = !loop"
            >
            <v-icon>fa-redo-alt</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-select
            :items="timeModes"
            item-text="name"
            v-model="timeMode"
            label="Tijd selectie"
            ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            :items="speedModes"
            item-text="name"
            v-model="speedMode"
            label="Snelheid"
        ></v-select>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</v-container>
</template>
<script>
import moment from "moment";
import * as d3 from "d3";

const timeModes = [
  {
    name: "JAAR",
    format: "%Y",
    interval: "year",
    timing: "yearly",
    momentFormat: "YYYY",
    extent: [
      moment()
        .startOf("year")
        .subtract(20, "year"),
      moment()
        .add(1, "year")
        .startOf("year")
    ],
    ticks: 19
  },
  {
    name: "DAG",
    format: "%-m-%Y",
    interval: "day",
    timing: "daily",
    momentFormat: "DD-MM-YYYY",
    extent: [
      moment()
        .startOf("day")
        .subtract(1, "year"),
      moment().startOf("day")
    ],
    ticks: 12
  }
]
const speedModes = [
  {
    value: 10000,
    name: "LANGZAAM"
  },
  {
    name: "NORMAAL",
    value: 5000
  },
  {
    value: 1000,
    name: "SNEL"
  }
]

// drawing properties
const slider = {
  width: 800,
  height: 20,
  margin: 10,
  labelWidth: 30,
  xScale: null,
  g: null
}

const handle = {
  height: 20,
  width: 5,
  x: 20,
  dragging: false
}

export default {
  name: "svg-time-slider",
  props: {
    startDate: {
      type: Object,
      required: true
    },
    endDate: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      timeModes,
      timeMode: timeModes[0],
      speedModes,
      speedMode: speedModes[0],
      handle,
      svg: null,
      loop: false,
      // mediaElement states
      state: 'PAUSED',
      slider: slider
    };
  },
  mounted() {
    this.svg = d3.select(this.$el).select('svg')
    this.updateScale()
    this.subscribeDrag()
    this.addAxis()
    // this.redraw()
  },
  methods: {
    updateScale() {
      this.slider.xScale = d3
        .scaleTime()
        .domain([this.startDate.toDate(), this.endDate.toDate()])
        .range([0, slider.width]);
    },
    addAxis () {
      let nTicks = 10

      let ticks = this.slider.xScale.ticks(nTicks)

      let tickLines = d3.select('.axes .x .ticks')

      tickLines
        .selectAll("line")
        .data(ticks)
        .enter()
        .append("line")
        .attr("x1", this.slider.xScale)
        .attr("x2", this.slider.xScale)
        .attr("y1", 0)
        .attr("y2", 10)

      let labels = d3.select('.axes .x .ticks-label')
      labels
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(ticks)
        .enter()
        .append("text")
        .attr("x", this.slider.xScale)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(d => this.formatDate(d));


    },
    subscribeDrag() {
      let handle = d3.select('.handle')
      let drag = d3
          .drag()

      drag
        .on("start.interrupt", () => {
          // stop dragging
          handle.interrupt()
          this.handle.dragging = false
        })
        .on("start drag", () => {
          // start dragging, register data and move
          let x = d3.event.x
          if (x < 0) {
            x = 0
          }
          if (x > this.slider.width) {
            x = this.slider.width
          }
          this.handle.x = x
          this.handle.dragging = true
          this.handle.date = this.slider.xScale.invert(d3.event.x)
        })
        .on("end", () => {
          // stop dragging
          this.handle.dragging = false
        })

      handle.call(drag)

    },

    updateSlider() {

      var nextStep = moment(this.step).clone();

      this.lanePeriod = this.slider
        .insert("rect")
        .attr("class", "lane-rect")
        .attr("y", -this.layers.length * (this.laneHeight + this.laneSpacing))
        .attr(
          "height",
          this.layers.length * (this.laneHeight + this.laneSpacing)
        )
        .attr(
          "width",
          this.xScale(nextStep.add(1, this.mode.interval)) -
            this.xScale(this.step)
        )
        .attr("fill", "rgba(0, 0, 0, 0.2)")
        .call(
          d3
            .drag()
            .on("start.interrupt", () => {
              this.slider.interrupt();
            })
            .on("start drag", () => {
              this.dragging = true;
              this.step = moment(this.xScale.invert(d3.event.x)).startOf(
                this.mode.interval
              );
              if (
                this.step <= this.mode.extent[0] ||
                this.step >= this.mode.extent[1]
              ) {
                this.slider.interrupt();
                return null;
              }
              this.updateHandle();
            })
        );

      this.handle = this.slider
        .insert("circle")
        .attr("class", "track-overlay")
        .attr("class", "handle")
        .attr("id", "handle")
        .attr("r", 6);
    },
    createLaneGroup() {
      this.laneGroup = this.svg.append("g").attr("z-index", 0);
    },
    updateLaneGroup() {
      this.laneGroup
        .attr("height", this.trackHeight)
        .attr("width", this.sliderWidth)
        .attr(
          "transform",
          `translate(0, ${this.trackHeight -
            this.layers.length * this.laneHeight})`
        );

      var y = d3
        .scaleLinear()
        .domain([0, this.layers.length])
        .range([0, this.layers.length * (this.laneHeight + this.laneSpacing)]);

      this.laneGroup.selectAll("*").remove();

      var fontsize = 7;
      var margin = 4;
      this.layers.forEach((data, index) => {
        const dataLane = this.laneGroup
          .append("g")
          .attr("class", "dataLane")
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
          .attr("y1", y(index) - this.laneSpacing / 2)
          .attr("y2", y(index) - this.laneSpacing / 2)
          .attr("stroke", "rgb(21,66,115)");

        if (this.currentSliderMode === "JAAR") {
          dataLane
            .append("g")
            .selectAll(".dataIntervals")
            .data(
              data.dates.filter(
                x =>
                  x.type === "interval" &&
                  moment(x.date_start) >= this.mode.extent[0] &&
                  moment(x.date_end) <= this.mode.extent[1]
              )
            )
            .enter()
            .append("rect")
            .attr("id", x =>
              moment(x.date_start, x.dateFormat).format("DD-MM-YYYY")
            )
            .attr(
              "x",
              x =>
                this.xScale(moment(x.date_start, x.dateFormat)) +
                this.labelWidth
            )
            .attr("y", y(index) - this.laneSpacing / 2 + margin / 2)
            .attr("ry", 5)
            .attr("rx", 5)
            .attr("id", d => moment(d.date_start).format("YYYY"))
            .attr(
              "width",
              d =>
                this.xScale(moment(d.date_end, d.dateFormat)) -
                this.xScale(moment(d.date_start, d.dateFormat))
            )
            .attr("height", this.laneHeight - margin)
            .on("click", x => {
              this.step = moment(x.date_start, x.dateFormat);
              this.redraw();
            });
        }
        if (this.currentSliderMode === "DAG") {
          dataLane
            .append("g")
            .selectAll(".dataInstances")
            .data(
              data.dates.filter(
                x =>
                  x.type === "instance" &&
                  moment(x.date, x.dateFormat) >= this.mode.extent[0] &&
                  moment(x.date, x.dateFormat) <= this.mode.extent[1]
              )
            )
            .enter()
            .append("rect")
            .attr("class", "rect-instance")
            .attr("id", x => moment(x.date, x.dateFormat).format("DD-MM-YYYY"))
            .attr(
              "x",
              x => this.xScale(moment(x.date, x.dateFormat)) + this.labelWidth
            )
            .attr("y", y(index) - this.laneSpacing / 2 + margin / 2)
            .attr("ry", 2)
            .attr("rx", 2)
            .attr("width", 2)
            .attr("height", this.laneHeight - margin)
            .on("click", x => {
              this.step = moment(x.date, x.dateFormat);
              this.redraw();
            });
        }
      });
    },
    play(now) {
      this.dragging = true;
      this.timer = requestAnimationFrame(this.play);

      // first update, when this.last is still null, set value and return
      if (!this.last) {
        this.last = now;
        return;
      }

      // now we can just return if we are not playing (will result in a regular poll for playing)
      if (!this.state) {
        this.dragging = false;
        return;
      }

      // elapsed time in seconds
      const elapsed = (now - this.last) / this.currentSpeed.value;
      // seconds per frame did not elapse, we're done
      if (elapsed < 1 / this.maxFps) {
        // this keeps the number of events low (otherwise you get 60 events per second)
        return;
      }

      const nextStep = moment(this.step).add(1, this.mode.interval);

      if (nextStep >= this.mode.extent[1]) {
        if (this.loop) {
          this.step = this.mode.extent[0];
        } else {
          this.state = false;
          return;
        }
      } else {
        this.step = nextStep;
      }

      this.updateHandle();
      this.last = now;
      this.updateImages();
    },

    updateHandle() {
      if (this.currentSliderMode === "JAAR") {
        this.handle.style("visibility", "hidden");
      } else {
        this.handle.style("visibility", "visible");
      }
      this.handleLocationRounded = this.xScale(
        moment(this.step).startOf(this.mode.interval)
      );
      this.handle.attr("cx", this.handleLocationRounded);
      this.lanePeriod.attr("x", this.handleLocationRounded);
    },

    formatDate(d) {
      var timeFormat = d3.timeFormat(this.timeMode.format);
      return timeFormat(d);
    },

    redraw() {
      if (!this.mode) {
        return;
      }
      this.changeMargin();
      this.updateScale();

      this.svg.attr("width", this.svgWidth);
      this.updateLaneGroup();
      this.updateSlider();
      this.updateHandle();
    },

    updateImages() {
      this.$emit("update-timeslider", {
        dragging: this.dragging,
        beginDate: moment(this.step),
        endDate: moment(this.step).add(1, this.mode.interval),
        timing: this.currentSliderMode
      });
    }
  }
};
</script>

<style>

/* #slider .container{ */
/*   transform: translate(${this.labelWidth}, ${this.trackHeight})` */

/* } */

.frame {
  stroke: rgb(21, 66, 115);
  stroke-width: 1px;
  fill: none;
}

.handle {
  stroke-linecap: round;
  stroke: rgb(30, 30, 30);
  fill: black;
  cursor: pointer;
  transition: 0.1s stroke-width;
}
.handle.dragging {
  stroke-width: 4px;
}

.axes .x .ticks {
  stroke-width: 1px;
  stroke: black;
}
/* .track, */
/* .track-inset, */
/* .track-overlay { */
/*   stroke-linecap: round; */
/* } */

/* .track-inset { */
/*   stroke: rgb(21, 66, 115); */
/*   stroke-width: 3px; */
/*   stroke-linecap: round; */
/* } */

/* .track-lines { */
/*   stroke: rgb(21, 66, 115); */
/*   stroke-width: 1px; */
/*   stroke-linecap: round; */
/* } */

/* .track-overlay { */
/*   pointer-events: stroke; */
/*   stroke-width: 8px; */
/*   stroke: transparent; */
/*   cursor: pointer; */
/* } */

/* .handle { */
/*   fill: #fff; */
/*   stroke: #000; */
/*   stroke-opacity: 0.5; */
/*   stroke-width: 1.25px; */
/*   transition: 0.5s r; */
/* } */

/* .rect { */
/*   margin: 2px; */
/* } */
/* .rect-instance:hover { */
/*   fill: red; */
/* } */

/* .lane-rect { */
/*   cursor: grab; */
/* } */
</style>
