<template>
  <div class="component-wrapper">
    <v-progress-circular
      class="ma-6"
      v-if="loading"
      indeterminate
    ></v-progress-circular>
    <e-charts :ref="datatype" :options="options" :autoresize="true"> </e-charts>
  </div>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import moment from 'moment'
var colors = [
  {
    type: '1',
    name: 'Water',
    color: '#bdeeff'
  },
  {
    type: '2',
    name: 'Verhard oppervlak',
    color: '#ff817e'
  },
  {
    type: '3',
    name: 'Gras en Akker',
    color: '#eefad4'
  },
  {
    type: '4',
    name: 'Riet en Ruigte',
    color: '#debdde'
  },
  {
    type: '5',
    name: 'Bos',
    color: '#73bf73'
  },
  {
    type: '6',
    name: 'Struweel',
    color: '#d97a36'
  },
  {
    type: '0',
    name: 'Geen Data',
    color: '#00000'
  }
]

export default {
  name: 'VPiechart',
  props: {
    datatype: {
      type: String
    },
    zonalType: {
      type: String
    },
    polygon: {
      type: Object
    },
    dateBegin: {
      type: String
    },
    dateEnd: {
      type: String
    }
  },
  data() {
    return {
      loading: true,
      options: {}
    }
  },
  mounted() {
    this.fetchZonalData()
  },
  methods: {
    fetchZonalData() {
      const body = {
        dateBegin: this.dateBegin,
        dateEnd: this.dateEnd,
        region: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: this.polygon,
              properties: {
                id: 1
              }
            }
          ]
        },
        scale: 10
      }

      // If in voorspel mode,  the timeseries
      if (this.zonalType === 'zonal-timeseries') {
        body.dateBegin = moment(2000, 'YYYY').format('YYYY-MM-DD')
        body.dateEnd = moment()
          .add(10, 'years')
          .format('YYYY-MM-DD')
      }

      const json_body = JSON.stringify(body)
      fetch(
        `${this.$store.state.SERVER_URL}/map/${this.datatype}/${
          this.zonalType
        }/`,
        {
          method: 'POST',
          body: json_body,
          mode: 'cors',
          headers: {
            'Content-type': 'application/json'
          }
        }
      )
        .then(res => {
          return res.json()
        })
        .then(chartData => {
          if (this.zonalType === 'zonal-info') {
            const data = chartData[0].area_per_type.map(d => {
              const color = colors.find(color => color.type === d.type)
              return {
                name: color.name,
                value: d.area,
                itemStyle: {
                  color: color.color
                }
              }
            })
            this.createPieChart(data)
          } else if (this.zonalType === 'zonal-timeseries') {
            this.createLineChart(chartData[0])
          }
        })
    },
    createLineChart(data) {
      const options = {
        id: this.datatype,
        title: {
          text: `Tijdseries van ${this.datatype}`,
          x: 'center',
          textStyle: {
            fontFamily: 'Helvetica',
            fontSize: 16
          },
          subTextStyle: {
            fontFamily: 'Helvetica',
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: a => {
            return `${a.name}: ${a.value.toFixed(2)}m&sup2)`
          }
        },
        legend: {
          bottom: 'bottom',
          padding: [32, 0],
          textStyle: {
            fontFamily: 'Helvetica',
            fontSize: 14
          }
        }
      }
      this.options = { ...data, ...options }
      this.loading = false
      this.$emit('loaded', this.loading)
    },
    createPieChart(data) {
      this.options = {
        id: this.datatype,
        title: {
          text: `Verdeling van ${this.datatype} klassen`,
          subtext: `Van: ${this.dateBegin} Tot: ${this.dateEnd}`,
          x: 'center',
          textStyle: {
            fontFamily: 'Helvetica',
            fontSize: 16
          },
          subTextStyle: {
            fontFamily: 'Helvetica',
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: a => {
            return `${a.name}: ${a.value.toFixed(2)}m&sup2; (${a.percent}%)`
          }
        },
        legend: {
          bottom: 'bottom',
          padding: [32, 0],
          textStyle: {
            fontFamily: 'Helvetica',
            fontSize: 14
          }
        },
        series: [
          {
            name: this.datatype,
            type: 'pie',
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: data
          }
        ]
      }
      this.loading = false
      this.$emit('loaded', this.loading)
    }
  },
  components: {
    ECharts
  }
}
</script>

<style>
.component-wrapper {
  height: 450px;
  width: 100%;
}
.echarts {
  width: 100%;
  height: 100%;
}
</style>
