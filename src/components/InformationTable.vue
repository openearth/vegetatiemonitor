<template lang="html">
  <div class="datatable">
    <v-data-table
      :headers="headers"
      :items="properties"
      hide-default-header
      hide-default-footer
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs6-left">{{ props.item.name }}</td>
        <td class="text-xs6-left">{{ props.item.data }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    properties: {
      type: Array
    }
  },
  data() {
    return {
      headers: [
        {
          text: 'Eigenschap',
          align: 'left',
          sortable: false,
          value: 'name',
          width: '40%'
        },
        {
          text: 'Kwantiteit',
          value: 'data',
          align: 'left',
          sortable: false,
          width: '60%'
        }
      ],
      pagination: {
        rowsPerPage: 4
      }
    }
  },
  mounted() {
    console.log('information table loaded')
  }
}
</script>

<style lang="css"></style>
