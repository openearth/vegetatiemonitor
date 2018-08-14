<template>
  <div>
    <v-dialog v-model="disclaimer" persistent scrollable height="80vh" width="40vw" max-height="80vh" max-width="40vw">
      <v-card id="disclaimer" light>
        <v-card-title>
          <span class="headline">
            Disclaimer
          </span>
        </v-card-title>
        <v-card-text>
          <h1>Disclaimer</h1>
          TEXT
        </v-card-text>
        <v-card-actions class="text-xs-center">
          <v-btn @click.stop="disclaimer=false" round color="primary" dark>Agree and proceed to website</v-btn>
          <!-- <v-btn tutorialDialog=true" round color="primary" dark>Decline</v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      disclaimer: true
    }
  }
}
</script>
