/* eslint-disable react/react-in-jsx-scope */

import { storiesOf } from "@storybook/vue"

import Vue from "vue"

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

import TimeSlider from "../src/components/TimeSlider.vue"

Vue.use(Vuetify)

storiesOf("TimeSlider", module).add("default", () => ({
  components: { TimeSlider },
  template: "<time-slider></time-slider>"
}))
