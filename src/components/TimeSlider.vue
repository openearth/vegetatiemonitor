<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card flat color="transparent">
          <div id="slider"></div>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card flat color="transparent">
          <v-btn text @click="changeMode">
            {{ currentTimeMode }}
          </v-btn>
          <v-btn
            text
            @click="play()"
            v-if="state === 'PAUSED'"
          >
            <v-icon small>fa-play</v-icon>
          </v-btn>
          <v-btn
            text
            v-if="state === 'PLAYING'"
            @click="pause()"
          >
            <v-icon  small>fa-pause</v-icon>
          </v-btn>

          <v-btn
            text
            v-model="loop"
            @click="loop = !loop"
          >
            <v-icon>fa-redo-alt</v-icon>
          </v-btn>
          <v-btn text @click="changeSpeed">
            {{ currentSpeed.name }}
          </v-btn>
          {{ currentTimeMessage }}
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import moment from "moment";
import * as d3 from "d3";

export default {
  name: "time-slider",
  props: {
    layers: {
      type: Array,
      default: () => {
        return [];
      }
    },
    timeModesEnabled: {
      default: () => {
        return {
          JAAR: true,
          DAG: true
        }
      }
    },
    modes: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      state: 'PAUSED',
      step: moment(),
      dataLanes: null,
      loop: false,
      labelWidth: 150,
      laneHeight: 20,
      laneSpacing: 0,
      margin: {},
      timeModes: [
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
      ],
      periodHeight: 20,
      svg: null,
      mode: null,
      nTicks: 0,
      showPlay: true,
      maxFps: 10,
      slider: null,
      sliderWidth: 0,
      sliderHeight: 0,
      svgWidth: 0,
      trackHeight: 90,
      currentTime: "01-01-2009",
      currentTimeMode: "JAAR",
      dragging: false,
      speeds: [
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
      ],
      currentSpeed: "NORMAAL"
    };
  },
  watch: {
    layers() {
      if (!this.layers) return;
      this.redraw();
    }
  },
  computed: {
    currentTimeMessage() {
      let from = "{from}";
      let to = "{to}";
      if (this.step && this.mode) {
        from = moment(this.step).format(this.mode.momentFormat);
        to = moment(this.step)
          .add(1, this.mode.interval)
          .format(this.mode.momentFormat);
      }

      let message = `Current Image: from ${from} to: ${to}`;
      return message;
    }
  },
  mounted() {
    // Set the current mode (yearly or daily according to the selected route)
    let mode = this.timeModes.find(
      mode => mode.name === this.currentTimeMode
    )
    this.mode = mode

    // Create the svg OBJECTID

    this.svg = d3.select("#slider").append("svg");

    // Update the margins and scale
    if (this.mode) {
      this.changeMargin();
      this.updateScale();
    }

    this.svg
      .attr("width", this.sliderWidth + this.labelWidth)
      .attr("height", this.sliderHeight);

    this.createLaneGroup();
    this.updateLaneGroup();
    this.createSlider();
    // this.createCurrentPeriod()
    this.redraw();
    window.addEventListener("resize", () => {
      this.redraw();
    });
  },
  methods: {
    changeSpeed() {
      this.currentSpeed = this.getNextElementInArray(
        this.speeds,
        this.currentSpeed
      );
    },
    changeMode() {
      const sliderModes = this.sliderModes.map(mode => mode.mode);
      this.currentTimeMode = this.getNextElementInArray(
        sliderModes,
        this.currentTimeMode
      );
      this.mode = this.timeModes.find(
        mode => mode.name === this.currentTimeMode
      );
      this.redraw();
    },
    getNextElementInArray(array, selected) {
      const ind = array.indexOf(selected);
      if (ind === array.length - 1 || ind === -1) {
        selected = array[0];
      } else if (array.length !== 1) {
        selected = array[ind + 1];
      }
      return selected;
    },
    changeMargin() {
      var nLanes = this.layers.length;
      this.svgWidth = document.querySelector("div#slider").clientWidth;
      this.margin = 10;
      this.sliderWidth = this.svgWidth - this.labelWidth - 2 * this.margin;
      this.sliderHeight =
        this.trackHeight + this.laneHeight * nLanes + this.periodHeight;
      const nt = parseInt(this.sliderWidth / 40);
      this.nTicks = nt > this.mode.ticks ? this.mode.ticks : nt;
    },

    updateScale() {
      this.xScale = d3
        .scaleTime()
        .domain(this.mode.extent)
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
      this.slider
        .append("line")
        .attr("class", "track")
        .attr("x1", this.xScale.range()[0])
        .attr("x2", this.xScale.range()[1])
        .attr("y1", 0)
        .attr("y2", 0)
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
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
                this.handle.attr("r", 6);
                return null;
              }
              this.handle.attr("r", 9);
              this.updateHandle();
            })
            .on("end", () => {
              this.dragging = false;
              this.updateImages();
              this.handle.attr("r", 6);
            })
        );

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
        .attr("y2", 10);

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

        if (this.currentTimeMode === "JAAR") {
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
        if (this.currentTimeMode === "DAG") {
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
      this.state = 'PLAYING'
      this.dragging = true

      let playLoop = () => {
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
        const elapsed = (now - this.last) / this.currentSpeed.value;
        // seconds per frame did not elapse, we're done
        if (elapsed < 1 / this.maxFps) {
          // this keeps the number of events low (otherwise you get 60 events per second)
          return
        }

        const nextStep = moment(this.step).add(1, this.mode.interval);

        if (nextStep >= this.mode.extent[1]) {
          if (this.loop) {
            this.step = this.mode.extent[0]
          } else {
            this.state = 'PAUSED'
            return
          }
        } else {
          this.step = nextStep;
        }
        this.updateHandle()
        this.last = now
        this.updateImages()
      }
      playLoop()

    },
    pause() {
      this.state = 'PAUSED'
    },
    updateHandle() {
      if (this.currentTimeMode === "JAAR") {
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
      var timeFormat = d3.timeFormat(this.mode.format);
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
        timing: this.currentTimeMode
      });
    }
  }
};
</script>

<style>
#slider {
  /* padding: 50px; */
  width: calc(100% - 20px);
  height: 130px;
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
  stroke-width: 8px;
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

.rect {
  margin: 2px;
}
.rect-instance:hover {
  fill: red;
}

.lane-rect {
  cursor: grab;
}
</style>
