import {
  bus
} from '@/event-bus.js';

import Vue from 'vue';
import mapboxgl from 'mapbox-gl';
import LayerControl from './components/LayerControl';
import AnalysisPanel from './components/AnalysisPanel';
import VegLegger from './components/VegLegger';
import VStreamlines from './components/VStreamlines';
import KadastraleGrens from './components/KadastraleGrens';
import SatelliteImages from './components/SatelliteImages';
export default {
  name: 'app',
  data: function() {
    return {
      map: null,
      drawer: null,
      layers: []
    };
  },
  mounted() {
    this.map = this.$refs.map.map;

    bus.$on('select-layers', (layers) => {
      Vue.set(this, 'layers', layers);
    });

    // Event to add a json containing a mapbox layer to this.layers
    bus.$on('add-layer', (layer) => {
      this.layers.push(layer);
    });

    // Send out map-loaded event when the map is loaded and add controls
    this.map.on('load', (event) => {
      bus.$emit('map-loaded', this.map)
    });
  },
  methods: {},
  components: {
    'layer-control': LayerControl,
    'analysis-panel': AnalysisPanel,
    'v-veg-legger': VegLegger,
    'v-streamlines': VStreamlines,
    'v-kadastrale-grens': KadastraleGrens,
    'v-satellite-images': SatelliteImages
  },
};
