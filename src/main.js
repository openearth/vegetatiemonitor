import Vue from 'vue'
import './plugins/vuetify'
import './plugins/vue2mapbox-gl'
import App from './App.vue'
import store from './store.js'
import './registerServiceWorker'
import router from './router'

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
