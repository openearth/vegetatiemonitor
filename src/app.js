import {
  bus
} from '@/event-bus.js';

import Vue from 'vue';
import mapboxgl from 'mapbox-gl';
import LayerControl from './components/VLayerControl';
import AnalysisControl from './components/VAnalysisControl';
import SelectionPanel from './components/VSelectionPanel';
import MapLayers from './components/VMapLayers';
import VColofon from './components/VColofon';
import VDisclaimer from './components/VDisclaimer';

export default {
  name: 'app',
  data: function() {
    return {
      map: null,
      layers: [],
      selection: {
        beginDate: "2018-07-25",
        endDate: "2018-07-28",
        firstImage: null,
        secondImage: null,
      },
      drawer: null
    };
  },
  mounted() {
    this.map = this.$refs.map.map;
    this.map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
      }));
    // This is needed to remove duplicate layers (happens for the composite layers)
    bus.$on('remove-data-layer', (data) => {

      var menulayer = _.find(this.layers, {
        'dataset': data['dataset']
      })
      _.each(menulayer['data'], (datalayer, i) => {
        if (datalayer != undefined && datalayer['id'] === data['dataset'] + '_composite') {
          menulayer['data'].splice(i, 1)
          console.log('removing stuff', datalayer['id'])
          this.map.removeLayer(datalayer['id'])
          this.map.removeSource(datalayer['id'])
        }
      })
    })

    // This is needed to cache the layers already shown on the map in this.layers
    bus.$on('add-data-layer', (data) => {
      var menulayer = _.find(this.layers, {
        'dataset': data['dataset']
      })
      menulayer.data.push(data['layer'])
    })

    bus.$on('select-layers', (layers) => {
      Vue.set(this, 'layers', layers);
    })

    // Event to add a json containing a mapbox layer to this.layers
    bus.$on('add-layer', (layer) => {
      this.layers.push(layer);
    })

    // Send out map-loaded event when the map is loaded and add controls
    this.map.on('load', (event) => {
      bus.$emit('map-loaded', this.map)
    });

    this.map.on('error', (event) => {
      if (event.error.status === 429) {
        var source = this.map.getSource(event.sourceId)
        source.tiles = event.source.tiles
      }
      console.log('error', event)
    })
  },
  methods: {},
  components: {
    'v-layer-control': LayerControl,
    'v-selection-panel': SelectionPanel,
    'v-map-layers': MapLayers,
    'v-analysis-control': AnalysisControl,
    'v-colofon': VColofon,
    'v-disclaimer': VDisclaimer
  },
};
