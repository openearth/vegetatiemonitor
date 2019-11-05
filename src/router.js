import Vue from 'vue'
import Router from 'vue-router'
import Viewer from '@/views/Viewer.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/veld',
      name: 'home',
      component: Viewer
    },
    {
      path: '/verken',
      name: 'Verken',
      component: Viewer
    },
    {
      path: '/veld',
      name: 'Veld',
      component: Viewer
    },
    {
      path: '/voorspel',
      name: 'Voorspel',
      component: Viewer
    }
  ]
})
