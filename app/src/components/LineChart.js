
import { Line, mixins } from 'vue-chartjs'
import moment from 'moment'
// eslint-disable-next-line no-unused-vars
import chartjsPluginAnnotation from 'chartjs-plugin-annotation'

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options', 'diffType', 'done'],
  computed: {
    unit () {
      const units = {
        days: 'day', weeks: 'week', years: 'year', hours: 'hour'
      }
      return units[this.diffType]
    }
  },
  watch: {
    chartData (val, oldVal) {
      // console.log('updating chart')
      this.renderChart(this.chartData, this.options || {
        animation: {
          onComplete: this.done
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontSize: 16,
            usePointStyle: true
          }
        },
        tooltips: {
          bodyFontSize: 14,
          mode: 'index',
          intersect: true,
          callbacks: {
            title: (tooltipItems, data) => {
              var xLabel = tooltipItems[0].label
              var label = moment(tooltipItems[0].label).add(1, 'hour')
              var dt = moment(xLabel)
              if (this.unit === 'week') {
                let lastday = moment(dt).endOf('day').add(1, 'second').endOf('isoWeek')
                label = `${moment(xLabel).endOf('day').add(1, 'second').format('ddd D MMM YYYY')} - ${lastday.format('ddd D MMM YYYY')}`
              } else if (this.unit === 'day') {
                label = `${moment(xLabel).endOf('day').add(1, 'second').format('ddd D MMM YYYY')}`
              } else if (this.unit === 'hour') {
                let lastday = moment(dt).add(1, 'hour').endOf('hour')
                let startday = moment(dt).add(1, 'hour').startOf('hour')
                label = `${startday.format('lll')} - ${lastday.format('lll')}`
              } else if (this.unit === 'year') {
                let lastday = moment(dt).endOf('day').add(1, 'second').endOf('year')
                label = `${moment(xLabel).endOf('day').add(1, 'second').format('D MMM YYYY')} - ${lastday.format('D MMM YYYY')}`
              }
              return label
            },
            label: (tooltipItem, data) => {
              let datasetIndex = tooltipItem.datasetIndex
              let value = this.unit === 'hour' ? `${moment(tooltipItem.label).add(1, 'hour').format('ddd D MMM')}: ${tooltipItem.value}` : `${moment(tooltipItem.label).endOf('day').add(1, 'second').format('ddd D MMM')}: ${tooltipItem.value}`
              if (datasetIndex === 1 && this.chartData.datasets[datasetIndex] && this.chartData.metaData.compareLabels) {
                if (this.unit === 'hour') value = `${moment(this.chartData.metaData.compareLabels[moment(tooltipItem.label).add(1, 'hour')]).format('ddd D MMM')}: ${tooltipItem.value}`
                else value = `${moment(this.chartData.metaData.compareLabels[moment(tooltipItem.label).add(1, 'hour')]).endOf('day').add(1, 'second').format('ddd D MMM')}: ${tooltipItem.value}`
              }
              return value
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            type: 'time',
            scaleLabel: {
              display: true,
              labelString: 'Time',
              fontColor: '#333'

            },
            time: {
              unit: this.unit,
              isoWeekday: true,
              parser: function (date) {
                return moment(date).add(-1, 'hour')
              }
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              lablabelStringel: 'Ratings',
              fontColor: '#333'
            }
          }]
        }
      })
    },
    unit (val, oldVal) {
      if (val !== oldVal) {
        this.renderChart(this.chartData, this.options || {
          animation: {
            onComplete: this.done
          },
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            labels: {
              fontSize: 16,
              usePointStyle: true
            }
          },
          tooltips: {
            bodyFontSize: 14,
            mode: 'index',
            intersect: true,
            callbacks: {
              title: (tooltipItems, data) => {
                var xLabel = tooltipItems[0].label
                var label = moment(tooltipItems[0].label).add(1, 'hour')
                var dt = moment(xLabel)
                if (this.unit === 'week') {
                  let lastday = moment(dt).endOf('day').add(1, 'second').endOf('isoWeek')
                  label = `${moment(xLabel).endOf('day').add(1, 'second').format('ddd D MMM YYYY')} - ${lastday.format('ddd D MMM YYYY')}`
                } else if (this.unit === 'day') {
                  label = `${moment(xLabel).endOf('day').add(1, 'second').format('ddd D MMM YYYY')}`
                } else if (this.unit === 'hour') {
                  let lastday = moment(dt).add(1, 'hour').endOf('hour')
                  let startday = moment(dt).add(1, 'hour').startOf('hour')
                  label = `${startday.format('lll')} - ${lastday.format('lll')}`
                } else if (this.unit === 'year') {
                  let lastday = moment(dt).endOf('day').add(1, 'second').endOf('year')
                  label = `${moment(xLabel).endOf('day').add(1, 'second').format('D MMM YYYY')} - ${lastday.format('D MMM YYYY')}`
                }
                return label
              },
              label: (tooltipItem, data) => {
                let datasetIndex = tooltipItem.datasetIndex
                let value = this.unit === 'hour' ? `${moment(tooltipItem.label).add(1, 'hour').format('ddd D MMM')}: ${tooltipItem.value}` : `${moment(tooltipItem.label).endOf('day').add(1, 'second').format('ddd D MMM')}: ${tooltipItem.value}`
                if (datasetIndex === 1 && this.chartData.datasets[datasetIndex] && this.chartData.metaData.compareLabels) {
                  if (this.unit === 'hour') value = `${moment(this.chartData.metaData.compareLabels[moment(tooltipItem.label).add(1, 'hour')]).format('ddd D MMM')}: ${tooltipItem.value}`
                  else value = `${moment(this.chartData.metaData.compareLabels[moment(tooltipItem.label).add(1, 'hour')]).endOf('day').add(1, 'second').format('ddd D MMM')}: ${tooltipItem.value}`
                }
                return value
              }
            }
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              type: 'time',
              scaleLabel: {
                display: true,
                labelString: 'Time',
                fontColor: '#333'
              },
              time: {
                unit: this.unit,
                isoWeekday: true,
                parser: function (date) {
                  return moment(date).add(-1, 'hour')
                }
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                lablabelStringel: 'Ratings',
                fontColor: '#333'
              }
            }]
          }
        })
      }
    }
  },
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    // console.log(this)
    this.renderChart(this.chartData, this.options || {
      animation: {
        onComplete: this.done
      },
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        labels: {
          fontSize: 16,
          usePointStyle: true
        }
      },
      tooltips: {
        bodyFontSize: 14,
        mode: 'index',
        intersect: true,
        callbacks: {
          title: (tooltipItems, data) => {
            var xLabel = tooltipItems[0].label
            var label = moment(tooltipItems[0].label).add(1, 'hour')
            var dt = moment(xLabel)
            if (this.unit === 'week') {
              let lastday = moment(dt).endOf('day').add(1, 'second').endOf('isoWeek')
              label = `${moment(xLabel).endOf('day').add(1, 'second').format('ddd D MMM YYYY')} - ${lastday.format('ddd D MMM YYYY')}`
            } else if (this.unit === 'day') {
              label = `${moment(xLabel).endOf('day').add(1, 'second').format('ddd D MMM YYYY')}`
            } else if (this.unit === 'hour') {
              let lastday = moment(dt).add(1, 'hour').endOf('hour')
              let startday = moment(dt).add(1, 'hour').startOf('hour')
              label = `${startday.format('lll')} - ${lastday.format('lll')}`
            } else if (this.unit === 'year') {
              let lastday = moment(dt).endOf('day').add(1, 'second').endOf('year')
              label = `${moment(xLabel).endOf('day').add(1, 'second').format('D MMM YYYY')} - ${lastday.format('D MMM YYYY')}`
            }
            return label
          },
          label: (tooltipItem, data) => {
            let datasetIndex = tooltipItem.datasetIndex
            let value = this.unit === 'hour' ? `${moment(tooltipItem.label).add(1, 'hour').format('ddd D MMM')}: ${tooltipItem.value}` : `${moment(tooltipItem.label).endOf('day').add(1, 'second').format('ddd D MMM')}: ${tooltipItem.value}`
            if (datasetIndex === 1 && this.chartData.datasets[datasetIndex] && this.chartData.metaData.compareLabels) {
              if (this.unit === 'hour') value = `${moment(this.chartData.metaData.compareLabels[moment(tooltipItem.label).add(1, 'hour')]).format('ddd D MMM')}: ${tooltipItem.value}`
              else value = `${moment(this.chartData.metaData.compareLabels[moment(tooltipItem.label).add(1, 'hour')]).endOf('day').add(1, 'second').format('ddd D MMM')}: ${tooltipItem.value}`
            }
            return value
          }
        }
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          type: 'time',
          scaleLabel: {
            display: true,
            labelString: 'Time',
            fontColor: '#333'

          },
          time: {
            unit: this.unit,
            isoWeekday: true,
            parser: function (date) {
              return moment(date).add(-1, 'hour')
            }
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            lablabelStringel: 'Ratings',
            fontColor: '#333'
          }
        }]
      }
    })
  }
}
