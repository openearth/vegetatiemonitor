<template>
  <div class="map">
    <v-mapbox
      access-token="pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA"
      map-style="mapbox://styles/mapbox/light-v9"
      :center="[5.673272, 52.079502]"
      :zoom="7.88"
      :pitch="0"
      :bearing="0"
      :min-zoom="5"
      class="map"
      ref="map"
    >
      <v-mapbox-geocoder />
      <v-mapbox-navigation-control />
      <mapbox-geolocate />
      <v-card id="t-slider" color="secondary">
        <time-slider
          ref="timeslider"
          :layers="timesliderLayers"
          :modes="modes"
          @update-timeslider="updateTimeslider($event)"
        >
        </time-slider>
      </v-card>
    </v-mapbox>
  </div>
</template>

<script>
import MapboxGeolocate from "../scripts/MapboxGeolocate";
import TimeSlider from "./TimeSlider";
import moment from "moment";

export default {
  name: "map-component",
  props: {
    layers: {
      type: Array
    },
    dateBegin: {
      type: String,
      required: true
    },
    dateEnd: {
      type: String,
      required: true
    },
    modes: {
      type: Array
    }
  },
  data: function() {
    return {
      map: null,
      region: {
        coordinates: [
          [
            [4.54, 52.71],
            [4.17, 50.75],
            [6.2, 50.7],
            [6.44, 52.68],
            [4.54, 52.71]
          ]
        ],
        geodesic: true,
        type: "Polygon"
      },
      polygons: [],
      scale: 10
    };
  },
  watch: {
    // Watch "layers". This is a switch, which can toggle a layer on or off
    // When toggled, this watcher will activate the toggleLayers function.
    layers: {
      deep: true,
      handler() {
        if (!this.mapLayers) return;
        this.toggleLayers();
        this.sortLayers();
      }
    }
  },
  computed: {
    mapLayers: {
      get() {
        return this.layers;
      },
      set(mapLayers) {
        this.$emit("setLayers", mapLayers);
      }
    },
    extent: {
      get() {
        return [this.dateBegin, this.dateEnd];
      },
      set(extent) {
        this.$emit("setDateBegin", extent[0]);
        this.$emit("setDateEnd", extent[1]);
      }
    },
    timesliderLayers() {
      if (!this.mapLayers) return;
      console.log(this.mapLayers);
      return this.mapLayers.filter(layer => layer.timeslider && layer.active);
    }
  },
  mounted() {
    this.map = this.$refs.map.map;
    this.map.on("load", () => {
      window.map = this.map;
      this.$emit("setMap", this.map);
      this.addMapboxLayers();
      // this.updateGEELayers()
      this.updateLayers();
      this.fetchDates();
      this.map.on("zoomend", this.fetchDates);
      this.map.on("dragend", this.fetchDates);
    });
  },
  provide() {
    return {
      getMap: () => {
        return this.map;
      }
    };
  },
  methods: {
    updateTimeslider(event) {
      this.extent = [
        moment(event.beginDate).format("YYYY-MM-DD"),
        moment(event.endDate).format("YYYY-MM-DD")
      ];
      (this.GEELayerType = event.GEELayerType),
        (this.dragging = event.dragging);
      this.updateGEELayers();

      this.updateVideoLayers(this.extent[0]);
    },
    deferredMountedTo(map) {
      console.log(map);
    },
    addMapboxLayers() {
      this.mapLayers.forEach(layer => {
        if (layer.layertype === "mapbox-layer") {
          layer.data.forEach(maplayer => {
            if (!this.map.getSource(maplayer)) {
              this.map.addLayer(maplayer);
            }
          });
        }
      });
    },
    updateGEELayers() {
      this.mapLayers.forEach(layer => {
        if (layer.layertype === "gee-layer") {
          // If layer is not active, return
          if (!layer.active) return;
          console.log("this.dragging", this.dragging);
          if (this.GEELayerType === "image" && this.dragging === false) {
            this.updateGEEImageLayer(layer);
          } else if (this.GEELayerType === "image") {
            this.updateGEEVideoLayer(layer);
          }
        }
      });
    },
    updateVideoLayers(time) {
      // HACK: prevent the first call with t = tMax
      if (!this.timeSliderInitialized) {
        this.timeSliderInitialized = true;
        return;
      }

      // get all video layers (Mapbox layers)
      let videoLayers = this.layers
        .filter(l => l.layertype === "mapbox-layer")
        .map(l => l.data[0])
        .filter(l => l.source.type === "video-tiled");

      // seek to current time
      videoLayers.forEach(layer => this._updateVideoLayerTime(layer, time));
    },
    updateVideoLayerTime(layer, time) {
      // compute time fraction
      time = moment(time);
      let begin = moment(layer.source.dateBegin);
      let end = moment(layer.source.dateEnd);
      let durationTotal = moment.duration(end.diff(begin)).asDays();
      let durationCurrent = moment.duration(time.diff(begin)).asDays();

      let fraction = durationCurrent / durationTotal;
      let t = layer.source.durationSec * fraction;

      t = Math.max(0, t);
      t = Math.min(layer.source.durationSec, t);

      console.log(`Setting time to ${t} ...`);

      let player = this.map.getSource(layer.id).player;

      player.setCurrentTime(t);
    },
    updateGEEImageLayer(layer) {
      const data = layer.data[0];

      // If existing gee layer on already has the correct dates and dataset, return
      if (layer.data.length > 0 && data.extent == this.extent) {
        return;
        //
      } else {
        var mapId = `${layer.dataset}_${this.extent.join("_")}`;
        var mapJson = {
          id: mapId,
          type: "raster",
          extent: this.extent,
          source: {
            type: "raster",
            tiles: [],
            tileSize: 256
          }
        };

        if (data && data.extent) {
          const oldMapId = `${layer.dataset}_${data.extent.join("_")}`;
          if (this.map.getSource(oldMapId)) {
            this.map.removeLayer(oldMapId);
            this.map.removeSource(oldMapId);
          }
        }

        const region = this.getRegion();
        var json_body = {
          dateBegin: this.extent[0],
          dateEnd: this.extent[1],
          region: region,
          vis: layer.vis
        };
      }

      if (this.map.getSource(mapId)) {
        this.map.removeLayer(mapId);
        this.map.removeSource(mapId);
      } else {
        fetch(`${this.$store.state.SERVER_URL}/map/${layer.dataset}/`, {
          method: "POST",
          body: JSON.stringify(json_body),
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          }
        })
          .then(res => {
            return res.json();
          })
          .then(mapUrl => {
            mapJson.source["tiles"] = [mapUrl["url"]];
            this.map.addLayer(mapJson);
            layer.data[0] = mapJson;
          });
      }
    },
    fetchDates() {
      const region = this.getRegion();
      const body = JSON.stringify({
        region: region
      });
      this.timesliderLayers.map(layer => {
        if (!layer.active) return;
        console.log("fetching times", layer.dataset);
        fetch(`${this.$store.state.SERVER_URL}/map/${layer.dataset}/times/`, {
          method: "POST",
          body: body,
          mode: "cors",
          headers: {
            "Content-type": "application/json"
          }
        })
          .then(res => {
            return res.json();
          })
          .then(times => {
            layer.dates = times.map(time => {
              return {
                id: time.imageId,
                type: "instance",
                time: moment(time.datetime, "YYYY-MM-DD HH:mm").format(
                  "DD-MM-YYYY"
                )
              };
            });
            this.mapLayers = this.mapLayers.map(l => {
              if (l.name === layer.name) {
                return layer;
              } else {
                return l;
              }
            });
          });
      });
    },
    updateGEEVideoLayer(layer) {
      console.log(
        "updateing video layer for: ",
        layer.dataset,
        "at",
        this.extent,
        "wtih",
        this.GEELayerType
      );
    },
    getRegion() {
      var N = this.map.getBounds().getNorth();
      var E = this.map.getBounds().getEast();
      var S = this.map.getBounds().getSouth();
      var W = this.map.getBounds().getWest();
      return {
        type: "Polygon",
        geodesic: true,
        coordinates: [[[W, N], [W, S], [E, S], [E, N], [W, N]]]
      };
    },
    updateLayers() {
      if (this.map) {
        this.sortLayers();
        this.toggleLayers();
      }
    },
    sortLayers() {
      // Function to sort the layers according to their position in the menu
      for (var i = this.mapLayers.length - 2; i >= 0; --i) {
        for (
          var thislayer = 0;
          thislayer < this.mapLayers[i].data.length;
          ++thislayer
        ) {
          if (this.mapLayers[i].data[thislayer].id) {
            this.map.moveLayer(this.mapLayers[i].data[thislayer].id);
          }
        }
      }
    },

    setOpacity(layer, sublayer) {
      if (layer.opacity) {
        try {
          var opacity = Math.max(layer.opacity * 0.01, 0.01);
          var property;
          if (layer.layertype == "gee-layer") {
            property = "raster-opacity";
          } else if (sublayer.type == "fill") {
            property = "fill-opacity";
          } else if (sublayer.type == "line") {
            property = "line-opacity";
          }
          if (property) {
            this.map.setPaintProperty(sublayer.id, property, opacity);
          }
        } catch (err) {
          console.log(
            "error setting opacity: " + opacity + "(" + err.message + ")"
          );
        }
      }
    },

    toggleLayers() {
      if (!this.mapLayers) return;
      // Function to toggle the visibility and opacity of the layers.
      var vis = ["none", "visible"];
      this.mapLayers.forEach(layer => {
        // if (layer.layertype === 'gee-layer' && layer.active) {
        //   this.updateGEELayers(layer.dataset, this.region, layer.vis)
        // } else
        if (layer.layertype === "mapbox-layer") {
          layer.data.forEach(sublayer => {
            if (layer.active) {
              this.map.setLayoutProperty(sublayer.id, "visibility", vis[1]);
              this.setOpacity(layer, sublayer);
            } else {
              this.map.setLayoutProperty(sublayer.id, "visibility", vis[0]);
            }
          });
        }
      });
    }
  },
  components: {
    MapboxGeolocate,
    TimeSlider
  }
};
</script>

<style>
@import "~mapbox-gl/dist/mapbox-gl.css";
@import "~mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

.map {
  width: 100%;
  height: 100%;
}

#t-slider {
  position: absolute;
  left: 20vw;
  bottom: 5vh;
  width: 70vw;
  right: 90vw;
  z-index: 2;
}
</style>
