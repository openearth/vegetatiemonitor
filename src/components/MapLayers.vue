<template>
  <div>
    <v-card small flat>
      <v-card-title>
        <h1>
          Kaartlagen
        </h1>
      </v-card-title>
    </v-card>

    <v-expansion-panel focusable dense flat>
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
                    :src="layer.icon"
                  />
                </v-flex>
                <v-flex xs7>
                  {{ layer.name }}
                </v-flex>
                <v-flex xs2>
                  <v-switch v-model="layer.active" />
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
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  computed: {
    layers: {
      get() {
        return this.$store.state.layers
      },
      set(layers) {
        this.$store.commit('setMapLayers', layers)
      }
    }
  },
  data() {
    return {}
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

.v-expansion-panel {
  box-shadow: none;
  webkit-box-shadow: none;
}
.v-expansion-panel__header {
  padding: 0;
  height: 48px;
}

.theme--light.v-expansion-panel .v-expansion-panel__container {
  border-top: none;
}
</style>
