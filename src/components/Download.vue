<template>
  <div id="download">
    <v-layout column fill-height justify-start>
      <v-card small flat>
        <v-card-title>
          <h1>
            Download
          </h1>
        </v-card-title>
        <v-card-text class="py-0 carddiv">
          <v-card flat>
            <v-layout
              id="cardlayout"
              align-center
              justify-space-end
              fill-height
              v-for="layer in layers"
              :key="layer.name"
            >
              <v-flex xs1>
                <v-checkbox
                  id="checkbox"
                  :key="layer.name"
                  v-model="layer.active"
                />
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
            </v-layout>
          </v-card>
        </v-card-text>
      </v-card>
      <v-flex shrink>
        <v-card small flat class="py">
          <v-card-title>
            <h2>
              Settings
            </h2>
          </v-card-title>
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  dense
                  v-model="resolution"
                  label="Resolutie"
                  clearable
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  dense
                  v-model="bbox"
                  label="Selecteer gebied"
                  clearable
                  append-icon="fa-draw-polygon"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex shrink>
        <v-layout justify-center align-start>
          <v-btn outline color="btncolor">
            download
          </v-btn>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
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
    return {
      resolution: 100,
      bbox: ''
    }
  },
  components: {}
}
</script>

<style scoped>
#checkbox {
  height: 100%;
  margin: auto;
}

.carddiv {
  max-height: 40vh;
  overflow-y: auto;
}
#cardlayout {
  width: 100%;
  height: 48px;
}

#download {
  max-height: 100%;
}
</style>
