/* eslint-disable react/react-in-jsx-scope */

import { storiesOf } from "@storybook/vue"

import Vue from "vue"

import vuetify from '../src/plugins/vuetify'
import moment from 'moment'

import 'vuetify/dist/vuetify.min.css'

import './styles.css'

import TimeSlider from "../src/components/TimeSlider.vue"
import SvgTimeSlider from "../src/components/SvgTimeSlider.vue"

import { modes } from  '../src/config/mode-options.js'
import layers from './layers.json'

// Vue.use(Vuetify)


storiesOf("TimeSlider Veld", module).add("default", () => ({
  components: { TimeSlider },
  data () {
    return {
      timeModes: modes[0].timeModes,
      layers

    }
  },
  template: `<time-slider :time-modes="timeModes" :layers="layers"></time-slider>`
}))


storiesOf("TimeSlider Verken", module).add("default", () => ({
  components: { TimeSlider },
  data () {
    return {
      timeModes: modes[1].timeModes,
      layers

    }
  },
  template: `<time-slider :time-modes="timeModes" :layers="layers"></time-slider>`
}))

storiesOf("TimeSlider Voorspel", module).add("default", () => ({
  components: { TimeSlider },
  data () {
    return {
      timeModes: modes[2].timeModes,
      layers

    }
  },
  template: `<time-slider :time-modes="timeModes" :layers="layers"></time-slider>`
}))


storiesOf("SvgTimeSlider", module)
  .add("default", () => ({
    vuetify,
    components: { SvgTimeSlider },
    data () {
      return {
        startDate: moment('2010-01-01'),
        endDate: moment('2019-01-01')
      }
    },
    template: `
<v-app>
  <svg-time-slider
    :start-date="startDate"
    :end-date="endDate"
  >
  <div>test</div>
  </svg-time-slider>
</v-app>
`
  }))
