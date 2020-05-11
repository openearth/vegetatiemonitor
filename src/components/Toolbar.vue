<template>
  <v-app-bar floating :clipped-left="true" app dense color="secondary">
    <!-- <v-toolbar dense fixed color="secondary" prominent class="pa-0"> -->

    <v-app-bar-nav-icon @click="$emit('update:drawer-state', !drawerState)">
      <v-icon>
        fa-bars
      </v-icon>
    </v-app-bar-nav-icon>
    <v-toolbar-title xs-3 class="hidden-sm-and-down"
      ><h3>Vegetatie Monitor</h3></v-toolbar-title
    >
    <v-spacer />
    <v-flex xs-6>
      <v-tabs background-color="transparent" fixed-tabs>
        <v-tab v-for="mode in modes" :key="mode.name" :to="{ name: mode.name }">
          {{ mode.name }}
        </v-tab>
      </v-tabs>
    </v-flex>
    <v-spacer />

    <v-img
      contain
      aspect-ratio="1"
      min-height="100%"
      max-height="100%"
      class="hidden-sm-and-down logo"
      src="images/deltares.svg"
    />
    <v-img
      contain
      aspect-ratio="1"
      min-height="100%"
      max-height="100%"
      class="hidden-sm-and-down logo"
      src="images/Rijkswaterstaat.svg"
    />
  </v-app-bar>
</template>

<script>
export default {
  name: 'toolbar',
  props: {
    drawerState: {
      type: Boolean
    },
    modes: {
      type: Array
    }
  }
}
</script>

<style>
.v-toolbar__content,
.v-toolbar__extension {
  padding: 0 12px;
  width: 100%;
}
</style>
