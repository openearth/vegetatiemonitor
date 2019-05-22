import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/veld',
      name: 'home',
      component: App
    },
    {
      path: '/verken',
      name: 'Verken',
      component: App
    },
    {
      path: '/veld',
      name: 'Veld',
      component: App
    },
    {
      path: '/voorspel',
      name: 'Voorspel',
      component: App
    }
  ]
})
