import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: 'Verken',
      name: 'Verken',
      component: App
    },
    {
      path: '/Verken',
      name: 'Verken',
      component: App
    },
    {
      path: '/Veld',
      name: 'Veld',
      component: App
    },
    {
      path: '/Voorspel',
      name: 'Voorspel',
      component: App
    }
  ]
})
