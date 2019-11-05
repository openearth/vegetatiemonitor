<template>
  <div id="legenddiv">
    <div class="legend">
      <h4>Legenda</h4>
      <v-divider />
    </div>
    <template v-if="layer.legend.range">
      <div
        v-if="layer.legend.colors"
        class="color-ramp"
        :style="
          `background: linear-gradient(to right, ${layer.legend.colors.join()});`
        "
      ></div>
      <div class="range-ramp">{{ layer.legend.range }}</div>
    </template>
    <div
      v-if="layer.legend.colors && layer.legend.labels"
      class="legend-colors"
    >
      <v-layout wrap class="color-label">
        <v-layout
          align-center
          v-for="(color, index) in layer.legend.colors"
          :key="index"
        >
          <span
            class="colored-span"
            :style="`background-color: ${color}`"
          ></span>
          <label class="ma-1">{{ layer.legend.labels[index] }}</label>
        </v-layout>
      </v-layout>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    layer: {
      type: Object
    }
  }
}
</script>

<style>
.color-ramp {
  height: 10px;
}
.range-ramp {
  text-align: justify;
  text-align-last: justify;
  width: 100%;
}

.legend-colors {
  display: inline-block;
}

.colored-span {
  width: 20px;
  height: 20px;
  border-radius: 5px;
}
</style>
