import 'chartjs-chart-box-and-violin-plot'
import { generateChart, mixins } from 'vue-chartjs'

const BoxPlot = generateChart('boxplot', 'boxplot')

export default {
  extends: BoxPlot,
  mixins: [mixins.reactiveProp],
  props: ['chartdata', 'options'],
  watch: {
    chartData (val, oldVal) {
      this.renderChart(this.chartData, this.options)
    }
  },
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, {
      legend: {
        display: false,
        labels: {
          fontSize: 16
        }
      },
      /*
        tooltips: {
        bodyFontSize: 18,
        callbacks: {
          label: (item) => ` ${item.yLabel} clicks`
        }
      }, */
      scales: {
        xAxes: [{
          display: true,
          ticks: {
            suggestedMin: 1,
            suggestedMax: 10
          },
          scaleLabel: {
            display: true,
            labelString: 'Rating'
          }
        }],
        yAxes: [{
          ticks: {
            maxRotation: 90,
            minRotation: 90
          }
        }]
      },
      responsive: true,
      maintainAspectRatio: false,
      height: 300
    })
  }
}
