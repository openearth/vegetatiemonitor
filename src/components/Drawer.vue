<template>
  <v-navigation-drawer
    v-model="$store.state.drawer"
    class="navdrawer ma-0"
    mini-variant
    hide-overlay
    fixed
  >
    Hoi
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      drawer: true
    }
  }
}
</script>

<style>
.navdrawer {
  top: 48px;
}
</style>
