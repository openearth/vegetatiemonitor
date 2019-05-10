import Vue from 'vue'
import './plugins/vuetify'
import './plugins/vue2mapbox-gl'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
