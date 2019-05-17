import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader

Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    primary: '#5B9BBF',
    secondary: '#F0F0F0',
    accent: '#8c9eff',
    error: '#b71c1c',
    btncolor: '#5A9ABF'
  }
})
