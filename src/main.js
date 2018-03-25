// Required to work on MSIE 11
import 'babel-polyfill'

import Vue from 'vue';
import Vuetify from 'vuetify';

import App from './App.vue';
import Vue2MapboxGL from 'vue2mapbox-gl';

Vue.use(Vue2MapboxGL);
Vue.use(Vuetify);

import 'vuetify/dist/vuetify.min.css';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
});
