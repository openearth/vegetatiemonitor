<template>
  <v-expansion-panel focusable dense>
    <draggable
      id="draggable"
      class="draggable"
      v-model="layers"
      @start="drag = true"
      @end="drag = false"
    >
      <v-expansion-panel-content
        class="ma-0 pa-0"
        v-for="layer in layers"
        :key="layer.id"
        extra-small
        expand-icon="fa-caret-down"
        hide-actions
      >
        <div slot="header" class="carddiv pa-1">
          <v-card class="carddiv">
            <v-layout align-center justify-space-end fill-height>
              <v-flex>
                <v-icon
                  class="ma-2"
                  id="dragicon"
                  title="Drag to change map layer drawing order"
                  small
                  >fa-grip-vertical</v-icon
                >
              </v-flex>
              <v-flex xs2>
                <v-img
                  contain
                  max-height="100%"
                  class="ma-1"
                  :src="layer.image"
                />
              </v-flex>
              <v-flex xs7>
                {{ layer.title }}
              </v-flex>
              <v-flex xs2>
                <v-switch />
              </v-flex>
              <v-flex>
                <v-icon class="ma-2" id="dragicon" title="Open details" small
                  >fa-caret-down</v-icon
                >
              </v-flex>
            </v-layout>
          </v-card>
        </div>
      </v-expansion-panel-content>
    </draggable>
  </v-expansion-panel>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  data() {
    return {
      layers: [
        {
          title: 'Kadaster',
          image: './images/legend-kadaster.png'
        },
        {
          title: 'Stroombanen',
          image: './images/legend-stroombaan.png'
        },
        {
          title: 'Classificatie vs Legger',
          image: './images/legend-classified.png'
        },
        {
          title: 'Classificatie',
          image: './images/legend-classified.png'
        },
        {
          title: 'Vegetatielegger',
          image: './images/legend-legger.png'
        }
      ]
    }
  },
  components: {
    draggable
  }
}
</script>

<style>
#dragicon {
  margin: auto;
}

#draggable {
  width: 100%;
}
.carddiv {
  width: 100%;
  height: 100%;
}
.v-expansion-panel__header {
  padding: 0;
  height: 48px;
}

.theme--light.v-expansion-panel .v-expansion-panel__container {
  border-top: none;
}
</style>
