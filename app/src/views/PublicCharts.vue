<template lang="pug">
  #public-charts
    Header(noback="true" nolinks="true")
    div(v-if="loading")
      Loader(:loading="loading")
    div(v-show="!loading")
      #event-info(v-if="session")
        h1#name {{ session[0].event_name }}
        #question {{ session[0].question }}
      #session
        #description
          .description(v-if="results && results.length > 0" v-show="!loading") Showing data from {{ fromDate }} to {{ toDate }}
          .description(v-if="results && results.length > 0" v-show="!loading") Number of participants: {{ pastCount }}
          .description(v-if="!feedback || !feedback.data || feedback.data.length === 0" v-show="!loading") Nothing to show
        transition(name="slide")
          #chart-container(v-if="results && results.length > 0 && showDonut" v-show="!loading")
            .chart-title Overall Ratings
            #donut
              donut-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="donutData")
        //- transition(name="slide")
        //-   #chart-container(v-if="results && results.length > 0 && !showDonut" v-show="!loading")
        //-     #chart-title {{ timeDiff }} Ratings
        //-     line-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="ratingLineData" :diffType="diffType" :height="600")
        transition(name="slide")
          #chart-container(v-if="results && results.length > 0 && !showDonut" v-show="!loading")
            .chart-title Mean Rating over Time
            line-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="ratingTimeChartData" :diffType="diffType" :height="400" :options="ratingTimeOptions")
        .description(v-if="results && results.length > 0" v-show="!loading && toDate") Data updated on {{ toDate }}
</template>

<script>
import api from '@/api'
import Loader from '@/components/Loader'
import moment from 'moment'
import Header from '@/components/Header'
import DonutChart from '@/components/DonutChart'
import LineChart from '@/components/LineChart'
import Datepicker from 'vuejs-datepicker'

export default {
  name: 'public-display',
  props: ['sessionId'],
  components: {
    Loader, DonutChart, LineChart, Datepicker, Header
  },
  mounted () {
    this.getFeedbackForTime(true)
    this.feedbackTimer = setInterval(() => {
      this.getFeedbackForTime(false)
    }, 60000)
    this.sliderTimer = setInterval(() => {
      this.fillDonut()
      this.fillRatingTimeLine()
      this.showDonut = !this.showDonut
    }, 30000)
  },
  data () {
    return {
      loading: false,
      feedbackTimer: null,
      session: null,
      results: null,
      feedback: null,
      timeResults: [],
      showDonut: true,
      sliderTimer: null,
      count: 0,
      pastCount: 0,
      ratings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // ratings: [0, 0, 0, 0, 0],
      // ratings: [0, 0, 0, 0],
      fromDate: null,
      toDate: null,
      donutData: {},
      ratingLineData: {},
      overallLineData: {},
      timeDiff: 'Daily',
      diffType: 'day',
      chartColours: [],
      ratingTimeChartData: {},
      ratingTimeOptions: {}
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
    variance (arr) {
      let len = 0
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        /* if (arr[i] === '') { }
         else if (!isNum(arr[i])) {
          alert(arr[i] + ' is not number, Variance Calculation failed!')
          return 0
        }
        else { */
        if (arr[i] !== '') {
          len = len + 1
          sum = sum + parseFloat(arr[i])
        }
      }
      let v = 0
      let variance = 0
      let confidence = 0
      if (len > 1) {
        let mean = sum / len
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === '') {} else { v = v + (arr[i] - mean) * (arr[i] - mean) }
        }
        variance = v / len
        confidence = 1.960 * Math.sqrt(variance / len)
        return { variance, mean, confidence }
      } else { return { variance: 0, mean: sum, confidence: 0 } }
    },
    getFeedbackForTime: async function (loading) {
      this.count = 0
      this.ratings = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      // this.ratings = [0, 0, 0, 0]
      // this.ratings = [0, 0, 0, 0, 0]
      this.loading = loading

      this.session = await api.getSessionEvent(this.sessionId)
      let feedback = await api.getPublicFeedback(this.sessionId)
      this.feedback = feedback

      this.loading = false
      if (!feedback || !feedback.data || feedback.data.length === 0) return

      this.results = feedback.data
      // console.log(feedback.date)
      let to = moment.utc(feedback.date)
      let from = moment(feedback.data[0].date_created)
      let diffType = 'days'
      let diff = to.diff(from, diffType)
      if (diff <= 2) {
        diffType = 'hours'
        this.timeDiff = 'Hourly'
        diff = to.diff(from, diffType)
      } else if (diff <= 27) {
        diffType = 'days'
        this.timeDiff = 'Daily'
        to = moment(feedback.date).endOf('day')
        diff = to.diff(from, diffType)
      } else if (diff <= 366) {
        diffType = 'weeks'
        this.timeDiff = 'Weekly'
        to = moment(feedback.date).endOf('day')
        diff = to.diff(from, diffType)
      } else {
        diffType = 'years'
        this.timeDiff = 'Annual'
        to = moment(feedback.date).endOf('day')
        diff = to.diff(from, diffType)
      }

      this.timeResults = []

      for (let i = 0; i < diff; i++) {
        this.timeResults[i] = {
          label: diffType === 'weeks' ? moment(to).startOf('isoWeek').add(-i, diffType) : moment(to).add(-i, diffType),
          overall: 0,
          ratings: new Array(10).fill(0)
        }
      }

      this.fromDate = moment(from.toDate()).format('D/M/YYYY, h:mm a')
      this.toDate = moment.utc(feedback.date).local().format('D/M/YYYY, h:mm a')
      this.diffType = diffType

      if (!this.results || this.results.length === 0) return
      this.filterResults(to, diffType)
    },
    filterResults (to, diffType) {
      // console.log('filtering results')
      this.results.forEach((el, i) => {
        let elTime = moment(el.date_created).startOf(diffType === 'weeks' ? 'isoWeek' : diffType)
        let timeResultIndex = moment(to).startOf(diffType === 'weeks' ? 'isoWeek' : diffType).diff(elTime, diffType)
        if (!this.timeResults[timeResultIndex]) this.timeResults[timeResultIndex] = { overall: 0, ratings: new Array(10).fill(0), label: diffType === 'weeks' ? moment(to).startOf('isoWeek').add(-timeResultIndex, diffType) : moment(to).add(-timeResultIndex, diffType) }
        this.timeResults[timeResultIndex].overall += 1
        this.timeResults[timeResultIndex].ratings[el.rating - 1] += 1

        this.count += 1
        if (el.rating <= 10) this.ratings[el.rating - 1] += 1
      })

      this.ratings = this.ratings.map((el, i) => {
        if (this.count > 0) {
          return (el / this.count * 100).toFixed(2)
        } else {
          return 0
        }
      })
      this.pastCount = this.count
      this.fillDonut()
      this.fillRatingTimeLine()
    },
    fillDonut () {
      this.getColours()
      this.donutData = {
        // labels: ['🙁', '😐', '🙂', '😀'],
        // labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        // type: 'doughnut',
        datasets: [{
          data: this.ratings,
          label: 'Results',
          backgroundColor: this.chartColours || '#8BC34A'
          // backgroundColor: '#8BC34A'
          // [ '#f44336', /* '#f1812f',  */'#FFC107', '#8BC34A', '#4caf50' ]
        }]
      }
    },
    fillRatingTimeLine () {
      let ratingTimeData = { upperBand: [], lowerBand: [], data: [] }
      let compareLabels = {}
      this.timeResults.forEach((el, i) => {
        if (!el.label) return
        let tempArr = []
        el.ratings.forEach((v, i) => {
          tempArr.push(...(new Array(v).fill(i + 1)))
        })
        let variance = this.variance(tempArr)
        ratingTimeData.data.push({
          x: el.label.startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType),
          y: variance.mean.toFixed(2)
        })

        ratingTimeData.upperBand.push({
          x: el.label.startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType),
          y: Math.min((variance.mean + variance.confidence).toFixed(2), 10)
        })

        ratingTimeData.lowerBand.push({
          x: el.label.startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType),
          y: Math.max((variance.mean - variance.confidence).toFixed(2), 0)
        })

        // ratingTimeData[0].push({
        //   x: el.label.startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType),
        //   y: el.overall === 0 ? 0 : el.ratings.reduce((acc, val, i) => acc + val * (i + 1), 0) / el.overall }
        // )
      })

      this.ratingTimeChartData = {
        metaData: { compareLabels: compareLabels },
        type: 'line',
        labels: ratingTimeData.data.map(el => el.x),
        datasets: [{
          label: 'All Time',
          fill: false,
          data: ratingTimeData.data,
          pointRadius: 5,
          lineTension: 0.2,
          backgroundColor: '#4192A1',
          borderColor: '#4192A1',
          barPercentage: 0.9
        },
        {
          label: 'Top Band',
          backgroundColor: 'rgba(65, 146, 161, 0.5)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 0,
          tension: 0,
          data: ratingTimeData.upperBand,
          yAxisID: 'y',
          xAxisID: 'x'
        },
        {
          label: 'Bottom Band',
          backgroundColor: 'rgba(65, 146, 161, 0.5)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 0,
          tension: 0,
          data: ratingTimeData.lowerBand,
          yAxisID: 'y',
          xAxisID: 'x'
        }]
      }
      const units = {
        days: 'day', weeks: 'week', years: 'year', hours: 'hour'
      }
      this.ratingTimeOptions = {
        legend: {
          display: false,
          labels: {
            fontSize: 16
          }
        },
        tooltips: {
          // bodyFontSize: 14,
          mode: 'index',
          intersect: true,
          callbacks: {
            title: (tooltipItems, data) => {
              var xLabel = tooltipItems[0].label
              var label = tooltipItems[0].label
              var dt = moment(xLabel)
              if (units[this.diffType] === 'week') {
                let lastday = dt.endOf('isoWeek')
                label = `${moment(xLabel).format('ddd D MMM YYYY')} - ${lastday.format('ddd D MMM YYYY')}`
              } else if (units[this.diffType] === 'day') {
                label = `${moment(xLabel).format('ddd D MMM YYYY')}`
              } else if (units[this.diffType] === 'hour') {
                let lastday = dt.endOf('hour')
                label = `${moment(xLabel).format('lll')} - ${lastday.format('lll')}`
              } else if (units[this.diffType] === 'year') {
                let lastday = dt.endOf('year')
                label = `${moment(xLabel).format('D MMM YYYY')} - ${lastday.format('D MMM YYYY')}`
              }
              return label
            }
          }
        },
        scales: {
          yAxes: [{
            id: 'y',
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
          xAxes: [{
            id: 'x',
            type: 'time',
            gridLines: {
              offsetGridLines: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Time'
            },
            time: {
              unit: units[this.diffType],
              isoWeekday: true
            }
          }]
        },
        responsive: true,
        maintainAspectRatio: false,
        height: 400
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import '~stylus/shared'

#public-charts
  padding-top 60px
  #question
    font-size: 1.8rem
  h3, h2
    margin: 10px 0 10px 0

#description
  padding-top: 10px

.description
  font-size: 1.2rem
  color: $text-lt-gray;
  margin-bottom 5px;
  font-weight: bold;

#session .date-created {
  font-size: 1.2rem !important
  color: #777 !important
  padding: 0 10mm 5mm 10mm
}

#date-created
    font-size: 0.85rem;
    color: $text-lt-gray;
    margin-bottom 5px;
#no-data
  font-size: 1.5rem
  font-weight: bold
  color: #ccc
  text-align: center

#session, #chart
  // background: #fafafa;
  border: 1px solid $border-light;
  padding: 10px;
  // border-radius: 10px;
  margin-bottom 10px
  margin-top 10px

#session-data
  display flex
  flex-direction row
  justify-content space-between
  align-items center

  #date
    font-size: 0.85rem;
    color: $text-lt-gray;
    margin-bottom: 5px;
  #rating
    margin: 0 0 0 10px;
    padding: 10px 10px;
    background: #f4f4f4;
    border-radius: 10px;
    display block;
    width: 25px;
    height: 25px;
h4
  margin-top: 0

#session-media
  margin-top: 10px

#answer-buttons {
  padding: 20px;

  .row {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;

    a {
      display: block;
      text-decoration: none;
      padding: 30px 20px 15px 20px;
      flex: 0.5;
      font-size: 5rem;
      margin: 5px;
      border-radius: 10px;
    }
  }
}

.event
  display: flex
  flex-direction row
  justify-content space-between
  align-items center
  padding 10px 10px
  margin-bottom: 10px
  background: #fafafa;
  border: 1px solid $border-light;
  border-radius: 10px;
  &:active
    background: $border-light;
  .event-data
    text-align: left;
  .ev-name
    font-size: 1.1rem;
    color: $secondary;
    font-weight: bold;
    margin-bottom: 5px;
  .ev-date
    font-size: 0.85rem;
    color: $text-lt-gray;
    margin-top: 5px;
  .event-icons
    display: flex;
    flex-direction: row-reverse;
  .ev-rating
    margin: 0 0 0 10px;
    padding: 10px 10px;
    background: #f4f4f4;
    // border: 1px solid #ddd;
    border-radius: 10px;
    display block;
    width: 25px;
    height: 25px;
  .ev-media
    margin: 0 0 0 10px;
    padding: 10px 10px;
    background: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size 20px;
    width: 25px;
    height: 25px;
    color: $text-lt-gray;
  a
    width: 100%
    padding 5px
    text-align center

#chart-container
  margin 20px auto
  border 1px solid $border-light

  #donut
    max-width 600px
    margin 0 auto

  #line
    height: 600px

  .chart-title
    text-transform uppercase
    margin 10px 5px 10px 5px
    font-weight: bold
    font-size: 0.9rem

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-enter-active {
  transition: all .3s ease;
}
.slide-leave-active {
  transition: all 0s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-enter, .slide-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(5%);
}
</style>
