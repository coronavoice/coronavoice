<template lang="pug">
  #thanks
    div(v-if="loading")
      Loader(:loading="loading")
    p(v-if="rating && rating.data.length > 0" v-show="!loading" style="margin: 1px") Generated on
      span(style="font-weight: bold")   {{ this.rating.date | moment('M/D/YYYY, hh:mma' ) }}
      | , with
      span(style="font-weight: bold")  {{ this.people }} participants
    donut-chart(v-if="rating && rating.data.length > 0" v-show="!loading" :chart-data="datacollection")
    #no-data(v-if="!rating || rating.data.length == 0" v-show="!loading") No data available

</template>

<script>
import api from '@/api'
import DonutChart from '@/components/DonutChart'
import Loader from '@/components/Loader'

export default {
  name: 'thanks',
  props: ['sessionId'],
  components: {
    DonutChart, Loader
  },
  mounted () {
    this.loading = true
    this.getColours()
    api.getSessionRatings(this.sessionId).then((result) => {
      this.loading = false
      this.rating = result
      this.fillData()
    })
  },
  data () {
    return {
      rating: null,
      datacollection: { },
      people: 0,
      loading: false,
      chartColours: null
    }
  },
  methods: {
    getColours () {
      // let red = `hsl(4, 90%, 58%)`
      let red = [4, 90, 58]
      let green = [122, 39, 49]
      this.chartColours = []
      for (let i = 0; i < 10; i++) {
        this.chartColours.push(`hsl(${Math.round(red[0] + i * (green[0] - red[0]) / 10)}, ${Math.round(red[1] - i * (red[1] - green[1]) / 10)}%, ${Math.round(red[2] + i * (green[2] - red[2]) / 10)}%)`)
      }
      // console.log(this.chartColours)
    },
    fillData () {
      let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      // let data = [0, 0, 0, 0, 0]
      this.people = 0
      this.rating.data.forEach((el) => {
        // if (el.rating <= 10) data[el.rating - 1] = el.count
        this.people += el.count
      })
      this.rating.data.forEach((el) => {
        if (el.rating <= 10) {
          if (this.people > 0) {
            data[el.rating - 1] = (el.count / this.people * 100).toFixed(2)
          } else {
            data[el.rating - 1] = 0
          }
        }
      })
      this.datacollection = {
        // labels: ['🙁', '😐', '🙂', '😀'],
        // labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        // type: 'doughnut',
        type: 'bar',
        datasets: [{
          data,
          label: 'Results',
          backgroundColor: this.chartColours || '#8BC34A' // [ '#f44336', /* '#f1812f',  */'#FFC107', '#8BC34A', '#4caf50' ]
        }]
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
#footer
  position: fixed
  background: white
  left: 0
  right: 0
  bottom: 0
  height: 50px
  display: flex
  flex-direction: row
  #fc
    flex: 1

#no-data
  font-size: 1.5rem
  font-weight: bold
  color: #ccc
  text-align: center

#thanks
  max-width 500px
  margin 0 auto

</style>
