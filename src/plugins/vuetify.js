import Vue from 'vue'
import Vuetify from 'vuetify'

import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader

Vue.use(Vuetify)

export default new Vuetify({
  iconfont: 'fa',
  theme: {
    themes: {
      light: {
        primary: '#5B9BBF',
        secondary: '#F0F0F0',
        accent: '#8c9eff',
        error: '#b71c1c',
        btncolor: '#5A9ABF'
      }
    }
  }
})
