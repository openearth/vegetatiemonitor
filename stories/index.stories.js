/* eslint-disable react/react-in-jsx-scope */

import { storiesOf } from "@storybook/vue"

import Vue from "vue"

import vuetify from '../src/plugins/vuetify'
import moment from 'moment'

import 'vuetify/dist/vuetify.min.css'

import './styles.css'

import TimeSlider from "../src/components/TimeSlider.vue"
import SvgTimeSlider from "../src/components/SvgTimeSlider.vue"

// Vue.use(Vuetify)

const settings =
storiesOf("TimeSlider", module).add("default", () => ({
  components: { TimeSlider },
  template: "<time-slider></time-slider>"
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
