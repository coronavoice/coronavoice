<template lang="pug">
  div.admin-charts-container
    #event-info
      h3#name {{ events[0].event_name }}
      #question {{ events[0].question }}
      span.date-created {{ events[0].event_date_created | moment('D/M/YYYY, hh:mma') }}

    #filters(v-if="results" v-show="!loading" style="margin-top: 1.6rem;")
      .filter-row#session-filter
        .filter
          label Show data for
          select#session-filter(name="session" @change="onSessionFilterChange($event)" v-model="selectedSessionFilter")
            option(value="all") All Sessions
            option(v-for="session, i in sessionList" :value="i") {{ session }}
      .filter-row#time-period-filter
        .filter
          button.time-period(:class="{selected: timePeriod == 'today' && !isCustomRangeSelectorOpen}" @click="selectTimePeriod('today')") Today
        .filter
          button.time-period(:class="{selected: timePeriod == 'thisWeek' && !isCustomRangeSelectorOpen}" @click="selectTimePeriod('thisWeek')") This Week
        .filter
          button.time-period(:class="{selected: timePeriod == 'thisMonth' && !isCustomRangeSelectorOpen}" @click="selectTimePeriod('thisMonth')") This Month
        .filter
          button.time-period(:class="{selected: timePeriod == 'allTime' && !isCustomRangeSelectorOpen}" @click="selectTimePeriod('allTime')") All Time
        .filter(style="position: relative;")
          button.time-period(:class="{selected: timePeriod == 'custom' || isCustomRangeSelectorOpen}" @click="openCustomRangeSelector()") Custom Range
          .custom-range-selector(:class="{selected: isCustomRangeSelectorOpen}")
            .datepicker
              span from:
              datepicker(name="timeFrom" v-model="datePickerFrom" :typeable="false" format="d/M/yyyy" input-class="datepicker-input" calendar-class="datepicker-calendar" :disabled-dates="{from: new Date(Math.min(new Date(), new Date(datePickerTo))), to: events[0].event_date_created ? new Date(events[0].event_date_created) : null}")
            .datepicker
              span to:
              datepicker(name="timeFrom" v-model="datePickerTo" :typeable="false" format="d/M/yyyy" input-class="datepicker-input" calendar-class="datepicker-calendar" :disabled-dates="{to: events[0].event_date_created ? new Date(Math.max(new Date(events[0].event_date_created), new Date(datePickerFrom))) : new Date(datePickerFrom)}")
            .datepicker
              button.time-period(@click="applyRangeFilter()") Apply

    #session(style="margin-top: 1.6rem;")
      div(v-if="loading")
        Loader(:loading="loading")
      .date-created(v-if="results  && results.length > 0" v-show="!loading") Showing data for {{ sessionList[selectedSessionFilter] || 'All Sessions' }} from {{ fromDate }} to {{ toDate }}
      .date-created(v-if="results  && results.length === 0" v-show="!loading") No results for the time range between {{ fromDate }} and {{ toDate }}
      div(v-if="results && results.length > 0" v-show="!loading")
        .number-containers
          .number-container#response-count
            .title Number of Responses
            .value {{ count[0] }}
              span(v-if="compareData")
                font-awesome-icon(icon="caret-up" v-if="count[0] - count[1] > 0" class="up-caret caret")
                font-awesome-icon(icon="caret-down" v-if="count[0] - count[1] < 0" class="down-caret caret")
            .compare(v-if="compareData") {{ timePeriodDisplayData[timePeriod][1] }}: {{ count[1] }}
          .number-container#average-rating
            .title Average Rating
            .value {{ averageRating[0].toFixed(2) }}
              span(v-if="compareData")
                font-awesome-icon(icon="caret-up" v-if="averageRating[0].toFixed(2) - averageRating[1].toFixed(2) > 0" class="up-caret caret")
                font-awesome-icon(icon="caret-down" v-if="averageRating[0].toFixed(2) - averageRating[1].toFixed(2) < 0" class="down-caret caret")
            .compare(v-if="compareData") {{ timePeriodDisplayData[timePeriod][1] }}: {{ averageRating[1].toFixed(2) }}
          .number-container#returning-users
            .title Returning Users
            .value {{ returningUserRatio[0] }}%
                span(v-if="compareData")
                  font-awesome-icon(icon="caret-up" v-if="returningUserRatio[0] - returningUserRatio[1] > 0" class="up-caret caret")
                  font-awesome-icon(icon="caret-down" v-if="returningUserRatio[0] - returningUserRatio[1] < 0" class="down-caret caret")
            .compare(v-if="compareData") {{ timePeriodDisplayData[timePeriod][1] }}: {{ returningUserRatio[1] }}%
          .number-container#comments-ratio
            .title Comment Responses
            .value {{ Math.round(commentRate[0] * 100) }}%
              span(v-if="compareData")
                font-awesome-icon(icon="caret-up" v-if="commentRate[0] - commentRate[1] > 0" class="up-caret caret")
                font-awesome-icon(icon="caret-down" v-if="commentRate[0] - commentRate[1] < 0" class="down-caret caret")
            .compare(v-if="compareData") {{ timePeriodDisplayData[timePeriod][1] }}: {{ Math.round(commentRate[1] * 100) }}%
          .number-container#average-sentiment
            .title Average Sentiment
            .value {{ averageSentiment[0].toFixed(3) }}
              span(v-if="compareData")
                font-awesome-icon(icon="caret-up" v-if="averageSentiment[0] - averageSentiment[1] > 0" class="up-caret caret")
                font-awesome-icon(icon="caret-down" v-if="averageSentiment[0] - averageSentiment[1] < 0" class="down-caret caret")
            .compare(v-if="compareData") {{ timePeriodDisplayData[timePeriod][1] }}: {{ averageSentiment[1].toFixed(3) }}
        .chart-container(v-if="results && results.length > 0" v-show="!loading" class="pagebreak")
          .chart-title Overall Ratings
          #overall-ratings(style="min-width: 300px")
            div(style="min-width: 250px")
              a.save-chart(@click="saveChart('ratingRelativeDistribution')")
                font-awesome-icon(icon="download")
                |  Save Image
              #donut(style="height: 400px; min-width: 47%;")
                donut-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="donutData" :options="donutOptions" :height="400" ref="ratingRelativeDistribution")
            div(style="min-width: 250px")
              a.save-chart(@click="saveChart('ratingDistribution')")
                font-awesome-icon(icon="download")
                |  Save Image
              #box-plot(style="height: 400px ; min-width: 200px; min-height: 400px;")
                box-plot-chart(:chart-data="datacollection" v-if="results && results.length > 0" v-show="!loading" :height="400" :options="boxPlotOptions" ref="ratingDistribution")
        .chart-container(v-if="results && results.length > 0" v-show="!loading" class="pagebreak")
          .chart-title Aggregated Data
          a.save-chart(@click="() => downloadCSV('AggregatedData.csv')" style="margin-left: 10px; cursor: pointer;" v-if="stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data']")
            font-awesome-icon(icon="download")
            |  Download as CSV
          .table-scroll
            table
              thead
                tr
                  th(:colspan="!compareData ? '1': '2'") Rating
                  th(v-for="n in 10") {{ n }}
              tbody
                tr
                  th.title(:rowspan="!compareData ? '1': '2'") Distribution
                  td.title(v-if="compareData") {{ timePeriodDisplayData[timePeriod][0] }}
                  td(v-if="stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data']" v-for="n in 10") {{ stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data'].distribution[n] }}
                  td(v-else)
                tr(v-if="compareData")
                  td.title(v-if="compareData") {{ timePeriodDisplayData[timePeriod][1] }}
                  td(v-if="stats[0].data[sessionList[selectedSessionFilter] || 'All Data']" v-for="n in 10") {{ stats[0].data[sessionList[selectedSessionFilter] || 'All Data'].distribution[n] }}
                  td(v-else)
                tr
                  th.title(:rowspan="!compareData ? '1': '2'") Relative Distribution
                  td.title(v-if="compareData") {{ timePeriodDisplayData[timePeriod][0] }}
                  td(v-if="stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data']" v-for="n in 10") {{ ((stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data'].relative_distribution[n] || 0) * 100).toFixed(2) }}%
                  td(v-else)
                tr(v-if="compareData")
                  td.title(v-if="compareData") {{ timePeriodDisplayData[timePeriod][1] }}
                  td(v-if="stats[0].data[sessionList[selectedSessionFilter] || 'All Data']" v-for="n in 10") {{ ((stats[0].data[sessionList[selectedSessionFilter] || 'All Data'].relative_distribution[n] || 0) * 100).toFixed(2) }}%
                  td(v-else)
            table
              thead
                tr
                  td(v-if="compareData")
                  th Rating Mean
                  th Rating Standard Deviation
                  th Sentiment Mean
                  th Sentiment Standard Deviation
                  th Comments
              tbody
                tr(v-if="stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data']")
                  th.title(v-if="compareData") {{ timePeriodDisplayData[timePeriod][0] }}
                  td {{ (stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data'].mean || 0).toFixed(2) }}
                  td {{ (stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data'].stdev || 0).toFixed(2) }}

                  td {{ averageSentiment[0].toFixed(3) }}
                  td {{ sentimentStdev[0].toFixed(3) }}

                  td {{ (stats[stats.length-1].data[sessionList[selectedSessionFilter] || 'All Data'].comments || 0) }}
                tr(v-else)
                  th.title(v-if="compareData") {{ timePeriodDisplayData[timePeriod][0] }}
                  td 0
                  td 0

                  td {{ averageSentiment[0].toFixed(3) || 0 }}
                  td {{ sentimentStdev[0].toFixed(3) || 0 }}

                  td 0
                tr(v-if="compareData && stats[0].data[sessionList[selectedSessionFilter] || 'All Data']")
                  th.title {{ timePeriodDisplayData[timePeriod][1] }}
                  td {{ (stats[0].data[sessionList[selectedSessionFilter] || 'All Data'].mean || 0).toFixed(2) }}
                  td {{ (stats[0].data[sessionList[selectedSessionFilter] || 'All Data'].stdev || 0).toFixed(2) }}

                  td {{ averageSentiment[1].toFixed(3) }}
                  td {{ sentimentStdev[1].toFixed(3) }}

                  td {{ (stats[0].data[sessionList[selectedSessionFilter] || 'All Data'].comments || 0) }}

        .chart-container(v-if="results && results.length > 0" v-show="!loading && diffType == 'weeks'")
          .chart-title Mean Rating over Time
          a.save-chart(@click="saveChart('meanratingtime')")
            font-awesome-icon(icon="download")
            |  Save Image
          line-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="ratingTimeChartData" :diffType="diffType" :height="400" :options="ratingTimeOptions" ref="meanratingtime")
        .chart-container(v-if="results && results.length > 0" v-show="!loading && selectedSessionFilter === 'all'" class="pagebreak")
          .chart-title Percentage of Responses by Site
          a.save-chart(@click="saveChart('responsesRelative')")
            font-awesome-icon(icon="download")
            |  Save Image
          donut-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="responsesRelativeChartData" :options="responseDonutOptions" :height="400" ref="responsesRelative")
        .chart-container(v-if="results && results.length > 0" v-show="!loading && selectedSessionFilter === 'all'")
          .chart-title Relative Ratings by Site
          a.save-chart(@click="saveChart('relativeLocationRating')")
            font-awesome-icon(icon="download")
            |  Save Image
          donut-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="relativeLocationRatingChartData" :options="relativeLocationOptions" :height="400" ref="relativeLocationRating")
        .chart-container(v-if="results && results.length > 0" v-show="!loading && selectedSessionFilter === 'all'" class="pagebreak")
          .chart-title Mean Rating by Site
          a.save-chart(@click="saveChart('meanLocation')")
            font-awesome-icon(icon="download")
            |  Save Image
          donut-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="meanLocationRatingChartData" :options="meanLocationOptions" :height="400" ref="meanLocation")
        .chart-container(v-if="sentiment && sentiment.length > 0" v-show="!loading && selectedSessionFilter === 'all'")
          .chart-title Sentiment by Site
          a.save-chart(@click="saveChart('sentimentSite')")
            font-awesome-icon(icon="download")
            |  Save Image
          vertical-box-plot-chart(:chart-data="sentimentSiteChartData" v-if="results && results.length > 0" v-show="!loading" :height="500" :options="sentimentSiteOptions" ref="sentimentSite")
        .chart-container(v-if="results && results.length > 0" v-show="!loading" class="pagebreak")
          .chart-title Overall Usage {{ diffType == 'weeks' ? 'per Week' : ''}}
          a.save-chart(@click="saveChart('overallLine')")
            font-awesome-icon(icon="download")
            |  Save Image
          line-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="overallLineData" :diffType="diffType" :height="400" ref="overallLine")
        .chart-container(v-if="results && results.length > 0" v-show="!loading && diffType == 'weeks'")
          .chart-title Overall Usage per Day
          a.save-chart(@click="saveChart('extraOverallLine')")
            font-awesome-icon(icon="download")
            |  Save Image
          line-chart(v-if="results && results.length > 0" v-show="!loading" :chart-data="extraOverallLineData" diffType="days" :height="400" ref="extraOverallLine")

</template>

<script>
import api from '@/api'
import Loader from '@/components/Loader'
import moment from 'moment'
import DonutChart from '@/components/DonutChart'
import LineChart from '@/components/LineChart'
import BoxPlotChart from '@/components/BoxPlotChart.js'
import VerticalBoxPlotChart from '@/components/VerticalBoxPlotChart.js'
import Datepicker from 'vuejs-datepicker'

export default {
  name: 'admin-sessions',
  props: ['eventId', 'events'],
  components: {
    Loader, DonutChart, LineChart, Datepicker, BoxPlotChart, VerticalBoxPlotChart
  },
  mounted () {
    this.getColours()
    // this.filters.from = moment().subtract(1, 'days')
    // this.filters.to = moment()
    this.selectedSessionFilter = this.$store.state.selectedSessionFilter
    this.datePickerFrom = this.$store.state.selectedTimePeriod && this.$store.state.selectedTimePeriod.from ? new Date(this.$store.state.selectedTimePeriod.from) : new Date()
    this.datePickerTo = this.$store.state.selectedTimePeriod && this.$store.state.selectedTimePeriod.to ? new Date(this.$store.state.selectedTimePeriod.to) : new Date()
    this.selectTimePeriod(this.$store.state.selectedTimePeriod ? this.$store.state.selectedTimePeriod.selectedTimePeriod : null)
    this.sessionList = { }
    this.events.forEach((el) => {
      this.sessionList[el.session_id] = el.session_name
    })
    if (this.selectedSessionFilter !== 'all' && !this.sessionList[this.selectedSessionFilter]) {
      this.selectedSessionFilter = 'all'
      this.onSessionFilterChange('all')
    }
  },
  data () {
    return {
      datePickerFrom: null,
      datePickerTo: null,
      loading: false,
      results: null,
      sentiment: null,
      stats: null,
      timeResults: [[], []],
      extraTimeResults: [[], []],
      ratingTimeChartData: {},
      ratingTimeOptions: {},
      count: [0, 0],
      commentRate: [0, 0],
      ratings: new Array(10).fill(0),
      filters: {
        from: null,
        to: null
      },
      availableFilters: {},
      donutData: {},
      donutOptions: {},
      responseDonutOptions: {},
      overallLineData: {},
      fromDate: null,
      toDate: null,
      timeDiff: 'Daily',
      diffType: 'day',
      sessionList: { },
      selectedSessionFilter: 'all',
      chartColours: null,
      averageRating: [0, 0],
      averageSentiment: [0, 0],
      sentimentStdev: [0, 0],
      timePeriod: 'today',
      timePeriodDisplayData: {
        today: ['Today', 'Yesterday'],
        thisWeek: ['This Week', 'Last Week'],
        thisMonth: ['This Month', 'Last Month'],
        allTime: ['All Time'],
        custom: [ 'Selected Time' ]
      },
      compareData: true,
      distributionBoxData: [[], []],
      responsesRelativeChartData: {},
      responsesRelativeData: [[], []],
      responsesRelativeLabels: [],
      meanLocationRatingChartData: [[], []],
      relativeLocationRatingChartData: [[], []],
      meanLocationRatingData: [[], []],
      relativeLocationRatingData: {},
      meanLocationErrorData: [{}, {}],
      meanLocationOptions: {},
      relativeLocationOptions: {},
      returningUserRatio: [0, 0],
      datacollection: {},
      boxPlotOptions: {},
      sentimentSiteData: [[], []],
      sentimentSiteLabels: [],
      sentimentSiteChartData: {},
      sentimentSiteOptions: {},
      returningUsers: {},
      returningUsersCompare: {},
      isCustomRangeSelectorOpen: false
    }
  },
  methods: {
    saveChart (refName) {
      let chart = this.$refs[refName]
      if (!chart) return
      let canvas = chart.$refs.canvas
      let imgData = canvas.toDataURL('image/png')
      let link = document.createElement('a')
      if (link.download !== undefined) {
        link.setAttribute('href', imgData)
        link.setAttribute('download', refName + '_' + Date.now() + '.png')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    buildCSV () {
      let csvValues = []
      let ratingTitleRow = ['Rating', '']
      for (let i = 1; i <= 10; i++) {
        ratingTitleRow.push(i)
      }
      let distributionRow = (isCompareRange, isRelative) => {
        let row = []
        row.push(isRelative ? 'Relative Distribution' : 'Distribution')
        row.push(this.timePeriodDisplayData[this.timePeriod][isCompareRange ? 1 : 0])
        let distributionType = isRelative ? 'relative_distribution' : 'distribution'
        for (let i = 1; i <= 10; i++) {
          if (this.stats[isCompareRange ? 0 : this.stats.length - 1].data[this.sessionList[this.selectedSessionFilter] || 'All Data']) {
            row.push(this.stats[isCompareRange ? 0 : this.stats.length - 1].data[this.sessionList[this.selectedSessionFilter] || 'All Data'][distributionType][i] || 0)
          } else {
            row.push(0)
          }
        }
        return row
      }

      let meanTitleRow = ['', 'Rating Mean', 'Rating Standard Deviation', 'Sentiment Mean', 'Sentiment Standard Deviation', 'Comments']
      let meanRow = (isCompareRange) => {
        let row = []
        row.push(this.timePeriodDisplayData[this.timePeriod][isCompareRange ? 1 : 0])
        if (this.stats[isCompareRange ? 0 : this.stats.length - 1].data[this.sessionList[this.selectedSessionFilter] || 'All Data']) {
          row.push(this.stats[isCompareRange ? 0 : this.stats.length - 1].data[this.sessionList[this.selectedSessionFilter] || 'All Data'].mean || 0)
          row.push(this.stats[isCompareRange ? 0 : this.stats.length - 1].data[this.sessionList[this.selectedSessionFilter] || 'All Data'].stdev || 0)
          row.push(this.averageSentiment[isCompareRange ? 1 : 0] || 0)
          row.push(this.sentimentStdev[isCompareRange ? 1 : 0] || 0)
          row.push(this.stats[isCompareRange ? 0 : this.stats.length - 1].data[this.sessionList[this.selectedSessionFilter] || 'All Data'].comments || 0)
        } else {
          for (let j = 0; j < 5; j++) {
            row.push(0)
          }
        }
        return row
      }

      csvValues.push(['Showing data for', this.sessionList[this.selectedSessionFilter] || 'All Sessions', 'from', this.fromDate, 'to', this.toDate])
      csvValues.push('')

      csvValues.push(ratingTitleRow)
      csvValues.push(distributionRow(false, false))
      if (this.compareData) csvValues.push(distributionRow(true, false))
      csvValues.push(distributionRow(false, true))
      if (this.compareData) csvValues.push(distributionRow(true, true))
      csvValues.push('')

      csvValues.push(meanTitleRow)
      csvValues.push(meanRow(false))
      if (this.compareData) csvValues.push(meanRow(true))

      return csvValues
    },
    downloadCSV () {
      let processRow = (row) => {
        let resultRow = ''
        for (let i = 0; i < row.length; i++) {
          let rowValue = row[i] === null ? '' : row[i].toString()
          if (row[i] instanceof Date) {
            rowValue = row[i].toLocaleString()
          };
          let result = rowValue.replace(/"/g, '""')
          if (result.search(/("|,|\n)/g) >= 0) { result = '"' + result + '"' }
          if (i > 0) { resultRow += ',' }
          resultRow += result
        }
        return resultRow + '\n'
      }

      let rows = this.buildCSV()
      let filename = `coronavoice_${this.selectedSessionFilter}_${Date.now()}.csv`
      let csvFile = ''
      for (let i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i])
      }

      let blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' })
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename)
      } else {
        let link = document.createElement('a')
        if (link.download !== undefined) {
          let url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', filename)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    },
    openCustomRangeSelector () {
      this.isCustomRangeSelectorOpen = !this.isCustomRangeSelectorOpen
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
    fillData () {
      this.datacollection = {
        labels: this.timePeriodDisplayData[this.timePeriod],
        datasets: [
          {
            label: 'Distribution',
            backgroundColor: 'rgba(65, 146, 161, 0.5)',
            borderColor: '#4192A1',
            borderWidth: 2,
            padding: 30,
            data: [this.distributionBoxData[0]]
          }
        ]
      }
      if (this.compareData) {
        this.datacollection.datasets[0].data.push(this.distributionBoxData[1])
      }
      this.boxPlotOptions = {
        title: {
          display: true,
          text: 'RATING DISTRIBUTION',
          position: 'bottom'
        },
        legend: {
          display: false,
          labels: {
            fontSize: 16
          }
        },
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
      }
    },
    fillSentimentData () {
      this.sentimentSiteChartData = {
        labels: this.sentimentSiteLabels,
        datasets: [
          {
            label: this.timePeriodDisplayData[this.timePeriod][0],
            backgroundColor: 'rgba(65, 146, 161, 0.5)',
            borderColor: '#4192A1',
            borderWidth: 2,
            padding: 30,
            data: this.sentimentSiteData[0]
          }
        ]
      }
      if (this.compareData) {
        this.sentimentSiteChartData.datasets.unshift({
          label: this.timePeriodDisplayData[this.timePeriod][1],
          backgroundColor: 'rgba(200, 200, 200, 0.5)',
          borderColor: '#bbb',
          borderWidth: 2,
          padding: 30,
          data: this.sentimentSiteData[1]
        })
      }
      this.sentimentSiteOptions = {
        title: {
          display: true,
          text: 'SENTIMENT BY SITE',
          position: 'bottom'
        },
        legend: {
          display: false,
          labels: {
            fontSize: 16
          }
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {

            },
            scaleLabel: {
              display: true,
              labelString: 'Site'
            }
          }],
          yAxes: [{
            ticks: {
              // maxRotation: 90,
              // minRotation: 90
            }
          }]
        },
        responsive: true,
        maintainAspectRatio: false,
        height: 600
      }
    },
    applyRangeFilter () {
      this.isCustomRangeSelectorOpen = false
      this.timePeriod = 'custom'
      this.compareData = false
      this.filters.from = this.datePickerFrom ? moment(this.datePickerFrom).startOf('day') : moment().startOf('day')
      this.filters.to = this.datePickerTo ? moment(this.datePickerTo).endOf('day') : moment().add(1, 'days').startOf('day')
      this.timePeriodDisplayData['custom'] = [ `${moment(this.filters.from).format('D MMM YYYY')} -  ${moment(this.filters.to).format('D MMM YYYY')}` ]
      this.getFeedbackForTime(this.filters.from, this.filters.to)
    },
    selectTimePeriod: function (timePeriod) {
      this.isCustomRangeSelectorOpen = false
      switch (timePeriod) {
        case 'today':
          this.timePeriod = timePeriod
          this.compareData = true
          this.filters.from = moment().startOf('day')
          this.filters.to = moment().endOf('day')
          this.getFeedbackForTime(this.filters.from, this.filters.to)
          break
        case 'thisWeek':
          this.timePeriod = timePeriod
          this.compareData = true
          // this.filters.from = moment().subtract(1, 'weeks').add(1, 'days').startOf('day')
          this.filters.from = moment().startOf('isoWeek')
          this.filters.to = moment().endOf('isoWeek')
          this.getFeedbackForTime(this.filters.from, this.filters.to)
          break
        case 'thisMonth':
          this.timePeriod = timePeriod
          this.compareData = true
          // this.filters.from = moment().subtract(1, 'month').add(1, 'days').startOf('isoWeek')
          this.filters.from = moment().startOf('month')
          this.filters.to = moment().endOf('month')
          this.getFeedbackForTime(this.filters.from, this.filters.to)
          break
        case 'allTime':
          this.timePeriod = timePeriod
          this.compareData = false
          this.filters.from = moment(0)
          this.filters.to = moment()
          this.getFeedbackForTime(this.filters.from, this.filters.to)
          break
        case 'custom':
          this.applyRangeFilter()
          break
        default:
          break
      }
    },
    onSessionFilterChange: function (event) {
      // console.log(this.selectedSessionFilter)
      this.$store.dispatch('updateAdminFilter', { selectedSessionFilter: this.selectedSessionFilter })
      this.getFeedbackForTime(moment(this.filters.from), moment(this.filters.to))
    },
    getFeedbackForTime: function (f, t) {
      this.$store.dispatch('updateAdminFilter', { selectedTimePeriod: { selectedTimePeriod: this.timePeriod, from: this.filters.from, to: this.filters.to } })
      this.count = [0, 0]
      this.ratings = [new Array(10).fill(0), new Array(10).fill(0)]
      this.loading = true
      let from = f || moment().subtract(1, 'days')
      let to = t || moment()
      this.sentment = null
      // console.log('time')
      api.getAdminEventSentiment(this.eventId, from.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'), to.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'), this.timePeriod).then((results) => {
        this.averageSentiment = [0, 0]
        this.sentimentStdev = [0, 0]
        this.sentimentSiteLabels = []
        this.sentimentSiteData = [[], []]
        this.sentiment = results.sentiment
        if (this.sentiment && this.sentiment.length > 0) {
          let selctedSessionName = this.sessionList[this.selectedSessionFilter]
          if (this.sentiment[this.sentiment.length - 1].data[selctedSessionName || 'All Data']) {
            this.averageSentiment[0] = this.sentiment[this.sentiment.length - 1].data[selctedSessionName || 'All Data'].mean
            this.sentimentStdev[0] = this.sentiment[this.sentiment.length - 1].data[selctedSessionName || 'All Data'].stdev
          }
          if (this.sentiment.length > 1 && this.sentiment[0].data[selctedSessionName || 'All Data']) {
            this.averageSentiment[1] = this.sentiment[0].data[selctedSessionName || 'All Data'].mean
            this.sentimentStdev[1] = this.sentiment[0].data[selctedSessionName || 'All Data'].stdev
          }
          if (this.selectedSessionFilter === 'all') {
            for (let s of Object.keys(this.sessionList)) {
              this.sentimentSiteLabels.push(this.sessionList[s])
            }
            this.sentimentSiteLabels.forEach((site, i) => {
              this.sentimentSiteData[0][i] = this.sentiment[this.sentiment.length - 1].data[site] ? this.sentiment[this.sentiment.length - 1].data[site].values : []
              if (this.sentiment.length > 0) this.sentimentSiteData[1][i] = this.sentiment[0].data[site] ? this.sentiment[0].data[site].values : []
            })
            this.$nextTick(() => {
              this.fillSentimentData()
            })
          }
        }
      })

      api.getAdminEventStats(this.eventId, from.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'), to.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'), this.timePeriod).then((result) => {
        this.results = result.result
        this.stats = result.stats

        if (this.timePeriod === 'allTime' && this.results[0].event.length > 0) {
          from = moment(this.results[0].event[0].date_created)
        } else if (this.timePeriod === 'allTime') {
          from = moment().subtract(1, 'days')
        }

        let mapping = { today: 'day', thisWeek: 'isoWeek', thisMonth: 'month', allTime: 'hour' }
        this.filters.to = moment.utc(this.results[0].to).endOf(mapping[this.timePeriod]).format('YYYY/MM/DD HH:mm:ss')
        // to = moment.utc(this.results[0].to).endOf(mapping[this.timePeriod])
        // to = moment.utc(this.results[0].to)
        to = moment(moment.utc(this.results[0].to).format('YYYY/MM/DD HH:mm:ss'))

        let diffType = 'days'
        from = moment(moment.utc(from).format('YYYY/MM/DD HH:mm:ss'))

        let diff = to.diff(from, diffType)
        if (diff <= 2) {
          diffType = 'hours'
          this.timeDiff = 'Hourly'
          diff = Math.min(to.diff(from, diffType) + 1, 24)
        } else if (diff <= 27) {
          diffType = 'days'
          this.timeDiff = 'Daily'
          diff = to.diff(from, diffType) + 1
        } else if (diff <= 366) {
          diffType = 'weeks'
          this.timeDiff = 'Weekly'
          diff = to.diff(moment(from).startOf('isoWeek'), diffType) + 1
        } else {
          diffType = 'years'
          this.timeDiff = 'Annual'
          diff = to.diff(from, diffType)
        }
        this.timeResults = [[], []]
        this.extraTimeResults = [[], []]

        if (this.timePeriod === 'thisWeek') {
          let weekTo = moment(to).endOf('isoWeek')
          for (let i = 0; i < 7; i++) {
            this.timeResults[0][i] = {
              label: moment(weekTo).add(-i, 'days').add(-1, 'hour'),
              overall: moment(to).isoWeekday() > i + 1 ? null : 0,
              ratings: new Array(10).fill(0)
            }

            this.timeResults[1][i] = {
              label: moment(weekTo).add(-i, diffType).add(-1, 'hour'),
              overall: 0,
              ratings: new Array(10).fill(0)
            }
          }
          to = moment(to).endOf('isoWeek')
        } else {
          for (let i = 0; i < diff; i++) {
            let overallVal = moment(this.results[0].to)
            let now = moment().endOf('hour')
            let comapre = moment(this.results[0].to).endOf(mapping[this.timePeriod]).isAfter(moment().endOf('hour'))
            let label = moment(to).add(-i, diffType)
            if (diffType === 'days') label.add(-1, 'hour')
            if (diffType === 'weeks') {
              if (moment(to).startOf('isoWeek').add(-i, diffType).isBefore(moment(from))) {
                label = moment(from)
              } else {
                label = moment(to).startOf('isoWeek').add(-i, diffType)
              }
            }
            this.timeResults[0][i] = {
              label,
              overall: moment(to).add(-i, diffType).isAfter(moment().startOf('hour')) ? null : 0,
              ratings: new Array(10).fill(0)
            }
            this.timeResults[1][i] = {
              label,
              overall: 0,
              ratings: new Array(10).fill(0)
            }
          }
          if (this.diffType === 'weeks') {
            let extraDiff = to.diff(from, 'days')
            for (let i = 0; i < extraDiff; i++) {
              this.extraTimeResults[0][i] = {
                label: moment(to).add(-i, 'days'),
                overall: 0,
                ratings: new Array(10).fill(0)
              }
              this.extraTimeResults[1][i] = {
                label: moment(to).add(-i, 'days'),
                overall: 0,
                ratings: new Array(10).fill(0)
              }
            }
          }
        }
        this.diffType = diffType
        this.returningUsers = {}
        this.returningUsersCompare = {}

        if (!this.results[0] || !this.results[0].event) return

        this.fromDate = moment.utc(this.results[0].from).format('D/M/YYYY, h:mm a')
        this.toDate = moment.utc(this.results[0].to).format('D/M/YYYY, h:mm a')

        this.returningUsers['all'] = [this.results[0].returningUsers[0][0].total_users, this.results[0].returningUsers[1][0].returning_users]
        Object.keys(this.sessionList).forEach(k => {
          this.returningUsers[k] = [0, 0]
        })
        this.results[0].returningUsers[2].forEach(el => {
          this.returningUsers[el.session_id][0] = el.total_users
        })
        this.results[0].returningUsers[3].forEach(el => {
          this.returningUsers[el.session_id][1] = el.returning_users
        })

        if (this.results[1] && this.results[1].returningUsers.length !== 0) {
          this.returningUsersCompare['all'] = [this.results[1].returningUsers[0][0].total_users, this.results[1].returningUsers[1][0].returning_users]
          Object.keys(this.sessionList).forEach(k => {
            this.returningUsersCompare[k] = [0, 0]
          })
          this.results[1].returningUsers[2].forEach(el => {
            this.returningUsersCompare[el.session_id][0] = el.total_users
          })
          this.results[1].returningUsers[3].forEach(el => {
            this.returningUsersCompare[el.session_id][1] = el.returning_users
          })
        }
        this.loading = false
        this.filterResults(to, diffType)
      })
    },
    filterResults (to, diffType) {
      let selectedSessionFilter = this.selectedSessionFilter
      this.averageRating = [0, 0]
      this.commentRate = [0, 0]
      this.distributionBoxData = [[], []]
      this.results[0].event.forEach((el, i) => {
        // let elTime = moment(el.date_created).startOf(diffType === 'weeks' ? 'isoWeek' : diffType)
        let elTime = moment(moment.utc(el.date_created).format('YYYY/MM/DD HH:mm:ss')).startOf(diffType === 'weeks' ? 'isoWeek' : diffType)
        let timeResultIndex = moment.utc(to).startOf(diffType === 'weeks' ? 'isoWeek' : diffType).diff(elTime, diffType)
        if (this.timePeriod === 'custom' && diffType === 'days') timeResultIndex++
        let n = this.timeResults[0]
        // eslint-disable-next-line eqeqeq
        if (selectedSessionFilter !== 'all' && el.session_id != selectedSessionFilter) return
        if (!this.timeResults[0][timeResultIndex]) this.timeResults[0][timeResultIndex] = { overall: 0, ratings: new Array(10).fill(0), label: diffType === 'weeks' ? moment(to).startOf('isoWeek').add(-timeResultIndex, diffType) : moment(to).add(-timeResultIndex, diffType) }
        this.timeResults[0][timeResultIndex].overall += 1
        // this.timeResults[0][timeResultIndex][el.rating] += 1
        this.timeResults[0][timeResultIndex].ratings[el.rating - 1] += 1

        if (diffType === 'weeks') {
          let extraTimeResultIndex = moment.utc(to).startOf('day').diff(moment.utc(el.date_created).startOf('day'), 'day')

          if (!this.extraTimeResults[0][extraTimeResultIndex]) this.extraTimeResults[0][extraTimeResultIndex] = { overall: 0, ratings: new Array(10).fill(0), label: moment(to).add(-extraTimeResultIndex, 'days') }
          this.extraTimeResults[0][extraTimeResultIndex].overall += 1
          this.extraTimeResults[0][extraTimeResultIndex][el.rating] += 1
        }
        this.count[0] += 1
        this.distributionBoxData[0].push(el.rating)
        // ratingSum += parseInt(el.rating)
      })
      this.returningUserRatio[0] = this.returningUsers[selectedSessionFilter][0] === 0 ? 0 : Math.round(this.returningUsers[selectedSessionFilter][1] / this.returningUsers[selectedSessionFilter][0] * 100)

      if (this.results[1] && this.results[1].event.length > 0) {
        let timeDiff = 0
        if (diffType === 'weeks') {
          timeDiff = moment(this.results[0].from).startOf('isoWeek').diff(moment(this.results[1].from).startOf('isoWeek'), diffType)
          // timeDiff = moment(this.results[0].to).startOf('isoWeek').diff(moment(this.results[1].to).startOf('isoWeek'), diffType) + 1
        } else {
          timeDiff = moment(this.results[0].from).startOf(diffType).diff(moment(this.results[1].from).startOf(diffType), diffType)
        }
        this.results[1].event.forEach((el, i) => {
          let dateCreated = moment.utc(el.date_created).add(timeDiff, diffType).startOf(diffType === 'weeks' ? 'isoWeek' : diffType)
          let timeResultIndex = moment.utc(to).startOf(diffType === 'weeks' ? 'isoWeek' : diffType).diff(dateCreated, diffType)
          // console.log('selected filter:' + selectedSessionFilter)
          // eslint-disable-next-line eqeqeq
          if (selectedSessionFilter !== 'all' && el.session_id != selectedSessionFilter) return
          if (!this.timeResults[1][timeResultIndex]) this.timeResults[1][timeResultIndex] = { overall: 0, ratings: new Array(10).fill(), label: diffType === 'weeks' ? moment(to).startOf('isoWeek').add(-timeResultIndex, diffType) : moment(to).add(-timeResultIndex, diffType) }
          this.timeResults[1][timeResultIndex].overall += 1
          // this.timeResults[1][timeResultIndex][el.rating] += 1
          this.timeResults[1][timeResultIndex].ratings[el.rating - 1] += 1

          if (diffType === 'weeks') {
            let extraTimeResultIndex = moment.utc(to).startOf('day').diff(moment.utc(el.date_created).add(moment(this.results[0].from).startOf('day').diff(moment(this.results[1].from).startOf('day'), 'day'), 'day').startOf('day'), 'day')

            if (!this.extraTimeResults[1][extraTimeResultIndex]) this.extraTimeResults[1][extraTimeResultIndex] = { overall: 0, ratings: new Array(10).fill(), label: moment(to).add(-extraTimeResultIndex, 'days') }
            this.extraTimeResults[1][extraTimeResultIndex].overall += 1
            this.extraTimeResults[1][extraTimeResultIndex][el.rating] += 1
          }
          this.count[1] += 1
          this.distributionBoxData[1].push(el.rating)
          // ratingSum += parseInt(el.rating)
        })
        this.returningUserRatio[1] = this.returningUsersCompare[selectedSessionFilter][0] === 0 ? 0 : Math.round(this.returningUsersCompare[selectedSessionFilter][1] / this.returningUsersCompare[selectedSessionFilter][0] * 100)
        if (this.timeResults[1][this.timeResults[1].length - 1].overall === 0) this.timeResults[1][this.timeResults[1].length - 1].overall = null
      }
      let selctedSessionName = this.sessionList[selectedSessionFilter]
      if (this.stats.length > 0) {
        if (this.stats[this.stats.length - 1].data[selctedSessionName || 'All Data']) {
          for (let r in this.stats[this.stats.length - 1].data[selctedSessionName || 'All Data'].relative_distribution) {
            this.ratings[0][parseInt(r) - 1] = (this.stats[this.stats.length - 1].data[selctedSessionName || 'All Data'].relative_distribution[r] * 100).toFixed(2)
          }
          this.averageRating[0] = this.stats[this.stats.length - 1].data[selctedSessionName || 'All Data'].mean
          this.count[0] = this.stats[this.stats.length - 1].data[selctedSessionName || 'All Data'].count
          this.commentRate[0] = this.stats[this.stats.length - 1].data[selctedSessionName || 'All Data'].comments / this.count[0]
        }
        if (this.stats.length > 1 && this.stats[0].data[selctedSessionName || 'All Data']) {
          for (let r in this.stats[0].data[selctedSessionName || 'All Data'].relative_distribution) {
            this.ratings[1][parseInt(r) - 1] = (this.stats[0].data[selctedSessionName || 'All Data'].relative_distribution[r] * 100).toFixed(2)
          }
          this.averageRating[1] = this.stats[0].data[selctedSessionName || 'All Data'].mean
          this.count[1] = this.stats[0].data[selctedSessionName || 'All Data'].count
          this.commentRate[1] = this.stats[0].data[selctedSessionName || 'All Data'].comments / this.count[1]
        }
      }
      // console.log(this.timeResults)
      /* if (this.count !== 0) {
        this.averageRating = ratingSum / this.count
      } */

      this.fillDonut()
      this.$nextTick(() => {
        this.fillRelativeResponsesBySite()
        this.fillRatingLine()
        this.fillData()
        if (this.sentiment) this.fillSentimentData()
      })
    },
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
    fillRelativeResponsesBySite () {
      if (this.selectedSessionFilter !== 'all') return
      this.meanLocationErrorData = [{}, {}]
      this.responsesRelativeData = [[], []]
      this.meanLocationRatingData = [[], []]
      this.relativeLocationRatingData = {}
      if (this.stats.length > 0) {
        this.responsesRelativeLabels = []
        for (let s of Object.keys(this.sessionList)) {
          this.responsesRelativeLabels.push(this.sessionList[s])
        }

        for (let k1 of Object.keys(this.stats[this.stats.length - 1].data)) {
          if (k1 === 'All Data') continue
          this.responsesRelativeData[0][this.responsesRelativeLabels.indexOf(k1)] = (this.stats[this.stats.length - 1].data[k1].count / this.count[0] * 100).toFixed(2)
          this.meanLocationRatingData[0][this.responsesRelativeLabels.indexOf(k1)] = (this.stats[this.stats.length - 1].data[k1].mean).toFixed(2)
          this.meanLocationErrorData[0][k1] = { plus: (this.stats[this.stats.length - 1].data[k1].stdev).toFixed(2) * 1, minus: -(this.stats[this.stats.length - 1].data[k1].stdev).toFixed(2) }
          this.relativeLocationRatingData[k1] = this.stats[this.stats.length - 1].data[k1].relative_distribution
        }

        if (this.stats.length > 1) {
          for (let k2 of Object.keys(this.stats[0].data)) {
            if (k2 === 'All Data') continue
            this.responsesRelativeData[1][this.responsesRelativeLabels.indexOf(k2)] = (this.stats[0].data[k2].count / this.count[1] * 100).toFixed(2)
            this.meanLocationRatingData[1][this.responsesRelativeLabels.indexOf(k2)] = (this.stats[0].data[k2].mean).toFixed(2)
            this.meanLocationErrorData[1][k2] = { plus: (this.stats[0].data[k2].stdev).toFixed(2) * 1, minus: -(this.stats[0].data[k2].stdev).toFixed(2) }
          }
        }
      }
      this.responsesRelativeChartData = {
        labels: this.responsesRelativeLabels,
        type: 'bar',
        datasets: [{
          label: this.timePeriodDisplayData[this.timePeriod][0],
          data: this.responsesRelativeData[0],
          backgroundColor: '#5ab847'
        }]
      }
      if (this.compareData) {
        this.responsesRelativeChartData.datasets.unshift({
          label: this.timePeriodDisplayData[this.timePeriod][1],
          data: this.responsesRelativeData[1],
          backgroundColor: '#ccc'
        })
      }
      this.responseDonutOptions = {
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
              callback: (value, index, values) => {
                return value + '%'
              },
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Responses'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Site'
            }
          }]
        },
        responsive: true,
        maintainAspectRatio: false,
        height: 400
      }

      let relativeDatasets = new Array(10).fill({}).map((el, x) => ({ label: x + 1, backgroundColor: this.chartColours[x], borderWidth: 2, borderColor: '#ffffff', data: [] }))
      this.responsesRelativeLabels.forEach((el, x) => {
        let site = this.relativeLocationRatingData[el]
        if (!site) return
        for (let r = 0; r < 10; r++) {
          relativeDatasets[r].data[x] = site[(r + 1).toString()] ? Math.round(site[(r + 1).toString()] * 10000) / 100 : 0
        }
      })

      this.relativeLocationRatingChartData = {
        labels: this.responsesRelativeLabels,
        type: 'bar',
        datasets: relativeDatasets
      }

      this.relativeLocationOptions = {
        legend: {
          display: true,
          labels: {
            fontSize: 16
          }
        },
        tooltips: {
        },
        scales: {
          yAxes: [{
            stacked: true,
            display: true,
            ticks: {
              suggestedMin: 0,
              max: 100
            },
            scaleLabel: {
              display: true,
              labelString: 'Rating'
            }
          }],
          xAxes: [{
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Site'
            }
          }]
        },
        responsive: true,
        maintainAspectRatio: false,
        height: 400
      }

      this.meanLocationRatingChartData = {
        labels: this.responsesRelativeLabels,
        type: 'bar',
        datasets: [{
          label: this.timePeriodDisplayData[this.timePeriod][0],
          data: this.meanLocationRatingData[0],
          backgroundColor: '#00a9ce',
          borderColor: 'rgba(0,0,0,0.3)',
          borderWidth: 0,
          errorBars: this.meanLocationErrorData[0]
        }]
      }
      if (this.compareData) {
        this.meanLocationRatingChartData.datasets.unshift({
          label: this.timePeriodDisplayData[this.timePeriod][1],
          data: this.meanLocationRatingData[1],
          backgroundColor: '#ccc',
          borderColor: 'rgba(0,0,0,0.3)',
          borderWidth: 0,
          errorBars: this.meanLocationErrorData[1]
        })
      }
      this.meanLocationOptions = {
        legend: {
          display: true,
          labels: {
            fontSize: 16
          }
        },
        tooltips: {
          callbacks: {
            label: (item) => (` ${item.yLabel}`)
          }
        },
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0,
              suggestedMax: 10
            },
            scaleLabel: {
              display: true,
              labelString: 'Rating'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Site'
            }
          }]
        },
        responsive: true,
        maintainAspectRatio: false,
        height: 400,
        annotation: {
          annotations: [{
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            value: this.averageRating[0].toFixed(2),
            borderColor: 'rgba(0,0,0,0.5)',
            borderWidth: 2,
            label: {
              position: 'right',
              yAdjust: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              enabled: true,
              content: 'Mean overall: ' + this.averageRating[0].toFixed(2)
            }
          }]
        }
      }
    },
    fillDonut () {
      this.donutData = {
        // labels: ['🙁', '😐', '🙂', '😀'],
        // labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        type: 'bar',
        datasets: [{
          label: this.timePeriodDisplayData[this.timePeriod][0],
          data: this.ratings[0],
          backgroundColor: this.chartColours || '#00a9ce'
        }]
      }
      if (this.compareData) {
        this.donutData.datasets.unshift({
          type: 'line',
          label: this.timePeriodDisplayData[this.timePeriod][1],
          data: this.ratings[1],
          borderColor: '#4192A1',
          bezierCurve: false,
          tension: 0.2,
          // borderColor: '#999',
          fill: false
        })
      }
      this.donutOptions = {
        title: {
          display: true,
          text: 'RATINGS RELATIVE DISTRIBUTION',
          position: 'bottom'
        },
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
              callback: (value, index, values) => {
                return value + '%'
              },
              beginAtZero: true
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
        height: 400
      }
    },
    fillRatingLine () {
      let data = [[], []]
      let ratingTimeData = { upperBand: [], lowerBand: [], data: [] }
      let compareLabels = {}
      this.extraOverallLineData = {}
      this.ratingTimeChartData = {}
      this.timeResults[0].forEach((el, i) => {
        if (!el.label) return
        // data[0].push({ x: el.label.startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType), y: el.overall })
        data[0].push({ x: el.label, y: el.overall })

        let tempArr = []
        el.ratings.forEach((v, i) => {
          tempArr.push(...(new Array(v).fill(i + 1)))
        })
        let variance = this.variance(tempArr)
        ratingTimeData.data.push({
          // x: moment(el.label).startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType),
          x: el.label,
          y: variance.mean.toFixed(2)
        })

        ratingTimeData.upperBand.push({
          x: el.label,
          y: (variance.mean + variance.confidence).toFixed(2)
        })

        ratingTimeData.lowerBand.push({
          x: el.label,
          y: (variance.mean - variance.confidence).toFixed(2)
        })

        // ratingTimeData[0].push({
        //   x: el.label.startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType),
        //   y: el.overall === 0 ? 0 : el.ratings.reduce((acc, val, i) => acc + val * (i + 1), 0) / el.overall }
        // )
      })
      this.timeResults[1].forEach((el, i) => {
        if (!el.label) return
        // data[1].push({ x: moment(el.label).startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType), y: el.overall })
        data[1].push({ x: moment(el.label), y: el.overall })
        // compareLabels[moment(el.label).startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType)] = moment(el.label).startOf(this.diffType === 'weeks' ? 'isoWeek' : this.diffType).add(-1 * this.timeResults[0].length, this.diffType)
        compareLabels[moment(el.label)] = moment(el.label).add(-1 * this.timeResults[0].length, this.diffType)
      })

      if (this.diffType === 'weeks') {
        let extraData = [[], []]
        let extraCompareLabels = {}
        let shift = this.extraTimeResults[1][0] ? 0 : 1
        // if (!this.extraTimeResults[1][0]) this.extraTimeResults[1][0] = ({ x: this.extraTimeResults[0][0].x, y: 0 })
        // this.extraTimeResults[0].forEach((el, i) => {
        //   if (!el.label) return
        //   extraData[0].push({ x: el.label.startOf('day'), y: el.overall })
        // })
        for (let i = 0; i < this.extraTimeResults[0].length; i++) {
          let el = this.extraTimeResults[0][i]
          if (!el || !el.label) {
            extraData[0].push({ })
          } else {
            extraData[0].push({ x: el.label.startOf('day').add(-2, 'hour'), y: el.overall })
          }
        }
        this.extraTimeResults[1].forEach((el, i) => {
          if (!el.label) return
          extraData[1].push({ x: moment(el.label).startOf('day').add(-2, 'hour').add(shift, 'day'), y: el.overall })
          extraCompareLabels[moment(el.label).startOf('day').add(-2, 'hour')] = moment(el.label).startOf('day').add(-2, 'hour').add(-1 * this.extraTimeResults[0].length, 'day')
        })

        this.extraOverallLineData = {
          metaData: { compareLabels: extraCompareLabels },
          type: 'line',
          datasets: [{
            label: this.timePeriodDisplayData[this.timePeriod][0],
            fill: false,
            data: extraData[0],
            lineTension: 0.2,
            backgroundColor: '#4192A1',
            borderColor: '#4192A1'
          }]
        }
        if (this.compareData) {
          this.extraOverallLineData.datasets.push({
            label: this.timePeriodDisplayData[this.timePeriod][1],
            fill: false,
            data: extraData[1],
            lineTension: 0.2,
            backgroundColor: '#ccc',
            borderColor: '#ccc'
          })
        }

        this.ratingTimeChartData = {
          metaData: { compareLabels: compareLabels },
          type: 'line',
          labels: ratingTimeData.data.map(el => el.x),
          datasets: [{
            label: this.timePeriodDisplayData[this.timePeriod][0],
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
      }
      // if (this.compareData) {
      //   this.ratingTimeChartData.datasets.unshift({
      //     label: this.timePeriodDisplayData[this.timePeriod][1],
      //     fill: false,
      //     data: ratingTimeData[1],
      //     lineTension: 0.2,
      //     backgroundColor: '#ccc',
      //     pointRadius: 5,
      //     borderColor: '#ccc',
      //     type: 'line',
      //     skipNullValues: false
      //   })
      // }
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

      this.overallLineData = {
        metaData: { compareLabels },
        type: 'line',
        datasets: [{
          label: this.timePeriodDisplayData[this.timePeriod][0],
          fill: false,
          data: data[0],
          lineTension: 0.2,
          backgroundColor: '#4192A1',
          borderColor: '#4192A1'
        }]
      }
      if (this.compareData) {
        this.overallLineData.datasets.push({
          label: this.timePeriodDisplayData[this.timePeriod][1],
          fill: false,
          data: data[1],
          lineTension: 0.2,
          backgroundColor: '#ccc',
          borderColor: '#ccc'
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
.datepicker-input
  color: $text_gray
  padding: 5px 10px;
  border-radius: 5px;
  border: none
  min-height: 32px;
  margin-top: 2px

.datepicker-calendar
  color: #444
  border-width: 2px
</style>

<style scoped lang="stylus">
@import '~stylus/shared'

#question
  font-size: 1.6rem;

.date-created
  font-size: 0.85rem;
  color: $text-lt-gray;
  margin-bottom 5px;
  font-weight: bold;

#session
  // background: #fafafa;
  border: 1px solid $border-light;
  // border-radius: 10px;
  padding: 10px 10px;
  margin-bottom 10px
  margin-top 10px
  background darken($body-background, 3)

.chart-container
  margin 40px auto
  border 1px solid $border-light;
  border-radius 5px
  background $body-background
  padding: 20px

  #donut
    max-width 500px
    margin 0 auto

  #line
    height: 300px

  .chart-title
    text-transform uppercase
    margin 10px 5px 10px 5px
    font-weight: bold
    font-size: 0.9rem

#filters
  display: flex
  border 1px solid $border-light
  // padding: 10px;
  flex-direction: row
  flex-wrap: wrap
  justify-content center
  align-items: center
  background darken($body-background, 3)
.filter-row
  // padding: 10px;
  // border 1px solid $border-light
  border: 0.25rem solid darken($body-background, 3)
  border-collapse collapse
  min-height: 2rem;
  display: flex
  flex-direction: row
  align-items: center
  flex-wrap: wrap
  margin: 10px

  select
    padding: 10px;

.filter
  margin 0 10px
  display: flex
  flex-direction: row
  label
    font-size: 0.85rem
    line-height: 2rem
    margin-right: 5px
    font-weight: bold
  input, select
    font-size: 0.8rem
    font-weight: bold;
    padding 5px 0.5rem
    border 1px solid $secondary
    color: $secondary
    background: white

.save-chart
  width: 100%;
  display: block;
  text-align: right;
  font-size: 0.9rem
  font-weight: bold
  cursor: pointer
  margin: 20px 0;

.custom-range-selector
  position: absolute;
  bottom: -234px;
  left: -10px;
  border: 1px solid $secondary
  background: $secondary
  color: white
  border-radius: 5px;
  flex-direction: row
  flex-wrap: wrap
  max-width: 90vw
  align-items: flex-end
  display: none

  &.selected
    display: flex

.datepicker
  display: inline-block
  text-align: left
  color: white
  font-size: 0.9rem
  font-weight: bold
  border: 1rem solid $secondary
  border-radius: 5px;

  button
    border: 1px solid white !important
    color: white !important;
    background: $secondary !important;
    &:hover
      color: $secondary !important;
      border: 1px solid $secondary !important
      background: white !important;

#session-filter
  flex-grow: 1
  .filter
    flex-wrap: wrap
  label, select
    flex: 1

#time-period-filter
  justify-content: center
  flex-wrap: nowrap
  flex-direction: row-reverse
  .filter
    margin 0 5px
  .time-period
    font-size: 0.8rem
    font-weight: bold
    color: $text-gray
    border: none
    background: none
    padding: 5px 10px
    border-radius: 5px
    min-height: 32px
    text-decoration: none
    cursor: pointer
    &:hover
      color: $secondary
      background: none
      border: 1px solid $secondary
      margin: 0 -1px
    &.selected
      background: $secondary
      border: none
      color: $text-light
      margin: 0

.number-containers
  display: flex
  flex-direction: row
  flex-wrap: wrap
  width: 100%
  justify-content center
  .number-container
    min-width: 160px
    max-width: 230px
    flex: 1
    font-weight: bold
    border-radius: 5px
    border: 1px solid $button-gray
    padding: 20px 20px
    margin: 10px
    color: $text-dark
    background $body-background

    .title
      color: $text-lt-gray
      font-size: 0.85rem

    .value
      color: $secondary
      font-size: 3.2rem
      margin: 1rem 0 5px 0
      white-space: nowrap

    .caret
      font-size: 2rem
      line-height: 3.8rem
      margin-left: 10px
      padding-bottom: 0.45rem

      &.up-caret
        color: green
      &.down-caret
        color: red

#overall-ratings
  display: flex
  flex-direction: column
  flex-wrap: nowrap
  &>div
    flex: 1
    min-width: 200px
    min-height: 440px

.table-scroll
  overflow:auto;
  display: flex;
  width: 100%
  flex-direction: column
  box-sizing: border-box

table
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid $button-gray;
  margin: 10px 0
  width: 100%
  overflow-x: auto

  th, td
    text-align: center;
    border: 1px solid $border-light;
    padding: 8px;

  td.title
    font-weight: bold

  th
    background: $secondary
    color: $text-light

  thead
    background: $secondary;
    color: $text-light;

@media screen and (min-device-aspect-ratio: 3072/4096)
  #overall-ratings
    display: flex
    flex-direction: row
    flex-wrap: wrap
</style>

<style lang="stylus">
@page {
  size: A4;
  // margin: 0;
  margin: 10mm 0;
}
@media print {
  html, body {
    width: 210mm;
    height: 297mm;
  }

  #session {
    background: white !important
    border: none !important
  }

  table {
    font-size: 75%;
    width: 176mm
  }

  td {
    padding: 8px 3px !important
  }

  #header, #footer, #info-footer, #tabs, #logo, #filters {
    display: none !important;
  }

  #session .date-created {
    font-size: 1.2rem !important
    color: #777 !important
    padding: 0 10mm 5mm 10mm
  }

  // .pagebreak { page-break-before: always; clear: both; }

  .chart-container {
    width: 176mm
    break-inside: avoid;
    border: 1px solid #ccc !important

    canvas {
      max-height: 100%;
      max-width: 100%;
      max-height: 400px;
      min-height: 300px;
      height: auto!important;
      width: auto!important;
    }

    #overall-ratings canvas {
      max-height: 450px;
      break-inside: avoid;
    }
  }
}
</style>
