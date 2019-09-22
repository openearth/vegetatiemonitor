<template>
  <div>
    <v-dialog
      v-model="disclaimer"
      persistent
      scrollable
      width="50vw"
      max-width="40vw"
    >
      <v-card light>
        <v-card-title>
          <span class="headline">
            Disclaimer
          </span>
        </v-card-title>
        <v-card-text>
          Welkom bij de Vegetatiemonitor versie 2.0. Deze quickscan-tool wordt
          ontwikkeld door Rijkswaterstaat en Deltares en is alleen te gebruiken
          als een eerste screening van de staat van de vegetatie in de
          uiterwaarden van het Nederlandse rivierengebied voor het geselecteerde
          satellietbeeld. Rijkswaterstaat en Deltares doen hun uiterste best om
          correcte resultaten te geven maar kunnen dit momenteel niet volledig
          garanderen. Aan de resultaten van de classificatie-beelden kunnen dus
          geen rechten worden ontleend.
        </v-card-text>
        <v-card-actions class="text-xs-center">
          <v-btn @click.stop="hideDisclaimer" color="primary" dark
                 >Accepteer en naar website
          </v-btn>
          <!-- <v-btn tutorialDialog=true" round color="primary" dark>Decline</v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import * as Cookies from 'tiny-cookie'

export default {
  data () {
    let disclaimer = Cookies.get('disclaimer')
    // if not set yet, return true
    if (disclaimer === null) {
      disclaimer = true
    }
    if (disclaimer === 'false') {
      disclaimer = false
    }
    return {
      disclaimer
    }
  },
  methods: {
    hideDisclaimer () {
      this.disclaimer = false
      Cookies.set('disclaimer', false)
    }
  }
}
</script>

<style>
.v-dialog,
v-dialog {
  min-width: 300px !important;
}
</style>
