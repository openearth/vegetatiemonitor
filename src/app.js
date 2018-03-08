import {
  bus
} from '@/event-bus.js';

import Vue from 'vue';
import mapboxgl from 'mapbox-gl';
import LayerControl from './components/LayerControl';
import VegLegger from './components/VegLegger';
import VStreamlines from './components/VStreamlines';
import KadastraleGrens from './components/KadastraleGrens';
export default {
  name: 'app',
  data: function() {
    return {
      map: null,
      drawer: null,
      layers: [],

    };
  },
  mounted() {

    this.map = this.$refs.map.map;

    bus.$on('select-layers', (layers) => {
      Vue.set(this, 'layers', layers);
    });
    bus.$on('add-layer', (layer) => {
      this.layers.push(layer);
    });
    this.map.on('load', (event) => {
      bus.$emit('map-loaded', this.map)
      this.map.addControl(new mapboxgl.NavigationControl());
    });
  },
  methods: {},
  components: {
    'layer-control': LayerControl,
    'v-veg-legger': VegLegger,
    'v-streamlines': VStreamlines,
    'v-kadastrale-grens': KadastraleGrens
  },
};
