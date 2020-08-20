// import { Doughnut, mixins } from 'vue-chartjs'
import { Bar, mixins } from 'vue-chartjs'
// eslint-disable-next-line no-unused-vars
import chartjsPluginErrorBars from 'chartjs-plugin-error-bars'

export default {
  // extends: Doughnut,
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: ['chartdata', 'options'],
  mounted () {
    this.addPlugin(chartjsPluginErrorBars)
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    // // console.log(this)
    this.renderChart(this.chartData, this.options || {
      legend: {
        display: true,
        labels: {
          fontSize: 16
        }
      },
      tooltips: {
        callbacks: {
          label: (item) => (` ${item.yLabel} %`)
        }
      },
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            beginAtZero: true,
            callback: (value, index, values) => {
              return value + '%'
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'Responses'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Rating'
          }
        }]
      },
      responsive: true,
      maintainAspectRatio: false,
      height: 300
    })
  }
}
