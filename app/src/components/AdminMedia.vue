<template lang="pug">
  div
    #event-info
      h3#name {{ events[0].event_name }}
      #question(v-html="events[0].followup_label")
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
    #filters(v-if="results" v-show="!loading" style="margin-top: 1.6rem; justify-content: center; padding: 5px 20px;")
      .filter-row#feedback-type-filter
        .filter
          label Show 
          select#session-filter(name="session" @change="onSessionFilterChange($event)" v-model="selectedTypeFilter")
            option(value="all") All
            option(value="1") Public
            option(value="0") Private
          label  comments
      .filter-row#rating-filter
        .filter
          label with a rating of 
          select#session-filter(name="session" @change="onSessionFilterChange($event)" v-model="selectedRatingFilter")
            option(value="all") Any
            option(v-for="n in 10" :value="n") {{ n }}
    #session(style="margin-top: 1.6rem;")
      h4 Media Feedback
      div(v-if="loading")
        Loader(:loading="loading")
      .date-created(v-if="!(results && results[sessionList[selectedSessionFilter] || 'All Data'] && results[sessionList[selectedSessionFilter] || 'All Data'].length > 0)" v-show="!loading") No comments

      .date-created(v-if="results && results[sessionList[selectedSessionFilter] || 'All Data'] && results[sessionList[selectedSessionFilter] || 'All Data'].length > 0" v-show="!loading") Showing {{ count }} results for the time range between {{ fromDate }} and {{ toDate }}
      .date-created(v-if="results  && results[sessionList[selectedSessionFilter] || 'All Data']&& results[sessionList[selectedSessionFilter] || 'All Data'].length > 0 && this.count != 0" v-show="!loading") {{ (publicCount / count * 100).toFixed(2) }}% of these results are marked as Public
      #feedback(v-if="results && results[sessionList[selectedSessionFilter] || 'All Data'] && results[sessionList[selectedSessionFilter] || 'All Data'].length > 0 && !loading" v-show="!loading" v-for="feedback in mediaResults")
        #feedback-data
          #date
            span.date-created {{ feedback.Date_Created | moment('D/M/YYYY, hh:mma' ) }}
            br
            span.date-created {{ sessionList[feedback.SessionId] }}
            //- br
            //- span.date-created Sentiment Analysis Score: {{ (feedback.Comparative || 0).toFixed(4) }}
          //- img#rating(:src="ratingImg[feedback.rating - 1]" :style="{'background-color': ratingColor[feedback.rating - 1]}")
          #rating
            .ev-rating( v-if="feedback.Rating" :alt="feedback.Rating-1" :style="{'background-color': ratingColor}")
              div(style="font-size: 0.7rem") Rating
              div {{ feedback.Rating }}
            .ev-rating( v-if="feedback.Rating" :style="{'background-color': consentColor[feedback.Comparative < 0 ? 0 : 1]}")
              div(style="font-size: 0.7rem") Sentiment
              div {{ (feedback.Comparative || 0).toFixed(3) }}
            .ev-rating( :style="{'background-color': consentColor[feedback.ConsentType] }") {{ feedback.ConsentType ? "Public" : "Private" }}

        #feedback-media(v-if="feedback.FeedbackType == 2")
          audio.media(controls)
            source(:src="feedback.FileLocation" type="audio/webm")
        #feedback-media(v-if="feedback.FeedbackType == 3")
          video.media(controls)
            source(:src="feedback.FileLocation" type="video/webm")
        #feedback-media(v-if="feedback.FeedbackType == 4")
          .text-feedback.media {{ feedback.Comment }}
          a.copy(@click="() => copyToClipboard(feedback.Comment)")
            font-awesome-icon(icon="copy")
            |  Copy

</template>

<script>
import api from '@/api'
import Loader from '@/components/Loader'
import moment from 'moment'
import Datepicker from 'vuejs-datepicker'
import image1 from '@/assets/5.svg'
import image2 from '@/assets/6.svg'
import image3 from '@/assets/7.svg'
import image4 from '@/assets/8.svg'

export default {
  name: 'admin-media',
  props: ['eventId', 'events'],
  components: {
    Loader, Datepicker
  },
  mounted () {
    // this.filters.from = moment().subtract(1, 'month').endOf('day').format('YYYY/MM/DD HH:mm:ss')
    // this.filters.to = moment().add(1, 'day').startOf('day').format('YYYY/MM/DD HH:mm:ss')
    this.selectedSessionFilter = this.$store.state.selectedSessionFilter
    this.selectedRatingFilter = this.$store.state.selectedRatingFilter
    this.selectedTypeFilter = this.$store.state.selectedTypeFilter
    this.selectedTimePeriod = this.$store.state.selectedTimePeriod
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
      mediaResults: [],
      count: 0,
      ratings: [0, 0, 0, 0],
      filters: {
        from: null,
        to: null
      },
      ratingImg: [image1, image2, image3, image4],
      ratingColor: '#8BC34A',
      // ratingColor: ['#f44336', /* '#f1812f', */ '#FFC107', '#8BC34A', '#4caf50'],
      consentColor: ['#f44336', '#4caf50'],
      // labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      availableFilters: {},
      donutData: {},
      fromDate: null,
      toDate: null,
      timeDiff: 'Daily',
      diffType: 'day',
      to: null,
      sessionList: { },
      selectedSessionFilter: 'all',
      selectedRatingFilter: 'all',
      selectedTypeFilter: 'all',
      timePeriod: 'today',
      timePeriodDisplayData: {
        today: ['Today', 'Yesterday'],
        thisWeek: ['This Week', 'Last Week'],
        thisMonth: ['This Month', 'Last Month'],
        allTime: ['All Time'],
        custom: [ 'Selected Time' ]
      },
      publicCount: 0,
      isCustomRangeSelectorOpen: false
    }
  },
  methods: {
    copyToClipboard (content) {
      const el = document.createElement('textarea')
      el.value = content
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      // el.style.visibility = 'hidden'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      const selected =
        document.getSelection().rangeCount > 0
          ? document.getSelection().getRangeAt(0)
          : false
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      if (selected) {
        document.getSelection().removeAllRanges()
        document.getSelection().addRange(selected)
      }
    },
    openCustomRangeSelector () {
      this.isCustomRangeSelectorOpen = !this.isCustomRangeSelectorOpen
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
      this.count = 0
      this.ratings = [0, 0, 0, 0]
      this.loading = true
      let from = f || moment().subtract(1, 'days')
      let to = t || moment()

      api.getAdminEventComments(this.eventId, from.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'), to.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')).then((result) => {
        this.results = result.comments[0]
        this.mediaResults = []
        let mapping = { today: 'day', thisWeek: 'isoWeek', thisMonth: 'month', allTime: 'hour' }
        this.filters.to = moment(to).endOf(mapping[this.timePeriod]).format('YYYY/MM/DD HH:mm:ss')
        to = moment(to).endOf(mapping[this.timePeriod])
        let diffType = 'days'
        let diff = to.diff(from, diffType)
        if (diff <= 2) {
          diffType = 'hours'
          this.timeDiff = 'Hourly'
          diff = to.diff(from, diffType)
        } else if (diff <= 60) {
          diffType = 'days'
          this.timeDiff = 'Daily'
          diff = to.diff(from, diffType)
        } else if (diff <= 366) {
          diffType = 'weeks'
          this.timeDiff = 'Weekly'
          diff = to.diff(from, diffType)
        } else {
          diffType = 'years'
          this.timeDiff = 'Annual'
          diff = to.diff(from, diffType)
        }
        this.timeResults = []
        for (let i = 0; i <= diff; i++) {
          this.timeResults[i] = {
            label: moment(to.toDate()).add(-i, diffType),
            overall: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
          }
        }

        this.diffType = diffType
        this.to = to

        this.loading = false
        if (!this.results) return
        this.fromDate = moment(from.toDate()).format('D/M/YYYY, h:mm a')
        if (moment(to.toDate()).isAfter(moment())) {
          this.toDate = moment().format('D/M/YYYY, h:mm a')
        } else {
          this.toDate = moment(to.toDate()).format('D/M/YYYY, h:mm a')
        }

        // console.log(this.results)
        /* this.availableFilters.sessions = []
        this.availableFilters.extraFilters = { filters: [ ], values: {} }
        this.results.forEach((el, i) => {
          if (this.availableFilters.sessions.indexOf(el.session_id) < 0) this.availableFilters.sessions.push(el.session_id)
          if (el.extra_data) {
            let extraData = JSON.parse(el.extra_data)
            for (let key in extraData) {
              // console.log(key)
              // eslint-disable-next-line eqeqeq
              if (this.availableFilters.extraFilters.values[key] == undefined) {
                this.availableFilters.extraFilters.values[key] = [ ]
                this.availableFilters.extraFilters.filters.push(key)
              }
              this.availableFilters.extraFilters.values[key].push(extraData[key])
            }
          }
        }) */
        this.filterResults(to, diffType)
      })
    },
    calculateMediaDuration: function (media) {
      return new Promise((resolve, reject) => {
        media.onloadedmetadata = function () {
          // set the mediaElement.currentTime  to a high value beyond its real duration
          // console.log(media)
          media.currentTime = Number.MAX_SAFE_INTEGER
          // listen to time position change
          media.ontimeupdate = function () {
            media.ontimeupdate = function () {}
            // setting player currentTime back to 0 can be buggy too, set it first to .1 sec
            media.currentTime = 0.1
            media.currentTime = 0
            // media.duration should now have its correct value, return it...
            resolve(media.duration)
          }
        }
      })
    },
    filterResults (to, diffType) {
      let selectedSessionFilter = this.selectedSessionFilter
      this.publicCount = 0
      if (this.results[this.sessionList[selectedSessionFilter] || 'All Data']) {
        this.mediaResults = this.results[this.sessionList[selectedSessionFilter] || 'All Data'].filter((el) => {
          // eslint-disable-next-line eqeqeq
          if (selectedSessionFilter !== 'all' && el.SessionId != selectedSessionFilter) return
          if (this.selectedTypeFilter !== 'all' && el.ConsentType != parseInt(this.selectedTypeFilter)) return
          if (this.selectedRatingFilter !== 'all' && el.Rating != parseInt(this.selectedRatingFilter)) return
          if (el.ConsentType == 1) this.publicCount++
          let isMedia = (el.FeedbackType === 4 || el.FileLocation)

          return isMedia
        })
      } else {
        this.mediaResults = []
      }
      this.count = this.mediaResults.length
      this.mediaResults = this.mediaResults.reverse()
      // console.log('mediaResults')
      // console.log(this.mediaResults)
      this.$nextTick(() => {
        let media = document.querySelectorAll('.media')
        for (let video in media) {
          if (media[video]) {
            this.calculateMediaDuration(media[video]).then(() => {
              // console.log(media[video].duration)
            })
          }
        }
      })
      // console.log(this.timeResults)
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
  font-size: 1.2rem;
  white-space: pre-wrap;

#question >>> li
  display: block !important;

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

.ev-rating
  margin: 5px 0 5px 10px;
  padding: 5px 10px;
  color: $text-light;
  background: $button-lt-gray;
  // border: 1px solid #ddd;
  border-radius: 5px;
  display flex;
  font-size: 0.95rem;
  // font-size: 12px;
  flex-direction: column
  justify-content center
  min-height 25px
  font-weight bold;
  min-width: 25px;

img.ev-rating
  width: 25px;
  height: 25px;
  padding: 5px 5px;

#feedback
  background: #fdfdfd;
  border: 1px solid $border-light;
  padding: 10px;
  // border-radius: 10px;
  margin-bottom 30px

#feedback-data
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  margin 10px auto

  #date
    font-size: 0.85rem;
    color: $text-lt-gray;
    margin-bottom: 5px;
    text-align: left;
  #rating
    margin: 0 0 0 10px;
    padding: 10px 10px;
    // background: #f4f4f4;
    // border-radius: 10px;
    // display block;
    // width: 25px;
    // height: 25px;
    display: flex
    flex-wrap: wrap
    flex-direction: row-reverse

  #feedback-media
    margin-top: 10px

video, audio
  max-width 100%
.text-feedback.media
  font-weight: 500;
  font-size: 1.1rem;
  white-space: pre-wrap;
  padding: 30px;
  border-radius: 5px;
  border: 1px solid darken($body-background, 10);
  margin: 0 auto;
  text-align: left

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

.copy
  padding: 0 10px;
  display: block;
  text-align: right;
  font-size: 1rem
  font-weight: bold
  cursor: pointer
  margin: 20px 0 10px 0;

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

#feedback-type-filter, #rating-filter
  justify-content flex-start
  margin-left: 0
  margin-right: 0
  border: none

  .filter
    flex-wrap: wrap
    margin-left: 0
    margin-right: 0
  label, select
    margin: 0 5px
  select
    min-width: 100px;

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
</style>
