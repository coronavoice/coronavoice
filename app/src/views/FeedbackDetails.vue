<template lang="pug">
  <PlainTemplate title="Details" back="true">
    <template v-slot:content>
    #event(v-if="loading")
      Loader(:loading="loading")
    #event(v-if="feedback && !loading")
      h3#name {{ feedback.event_name }} - {{ feedback.session_name }}
      #question {{ feedback.question }}
      #status This survey
        span(style="font-weight: bold")  {{ ['is finished', 'is currently ongoing', 'is under analysis'][feedback.session_status] }}

      div.description(v-html="feedback.description")

      #feedback
        h4 Your Feedback
        #feedback-data
          #date {{ feedback.date_created | moment('M/D/YYYY, hh:mma' ) }}
          //- img#rating(:src="ratingImg[feedback.rating - 1]" :style="{'background-color': ratingColor[feedback.rating - 1]}")
          //- #rating(:style="{'background-color': ratingColor[feedback.rating - 1]}") {{labels[feedback.rating - 1]}}
          #rating(:style="{'background-color': ratingColor}") {{ feedback.rating }}
        #feedback-media(v-if="feedback.extra_feedback_type == 2")
          audio#media(controls controlsList="nodownload")
            source(:src="feedback.file_location" type="audio/webm")
        #feedback-media(v-if="feedback.extra_feedback_type == 3")
          video#media(controls)
            source(:src="feedback.file_location" type="video/webm")
        #feedback-media(v-if="feedback.extra_feedback_type == 4")
          .text-feedback.media {{ feedback.extra_data ? JSON.parse(feedback.extra_data).text_feedback : '' }}
      #chart
        h4 Results
        thanks(:sessionId="feedback.session_id")
    </template>
  </PlainTemplate>
</template>

<script>
import api from '@/api'
import Thanks from '@/components/Thanks'
import image1 from '@/assets/5.svg'
import image2 from '@/assets/6.svg'
import image3 from '@/assets/7.svg'
import image4 from '@/assets/8.svg'
import Loader from '@/components/Loader'
import PlainTemplate from '@/components/PlainTemplate'

export default {
  name: 'FeedbackDetails',
  props: [ 'feedbackId' ],
  components: {
    Thanks, PlainTemplate, Loader
  },
  data () {
    return {
      rating: ['🙁', '😐', '🙂', '😀'],
      ratingImg: [image1, image2, image3, image4],
      ratingColor: '#8BC34A',
      // ratingColor: ['#f44336', /* '#f1812f',  */'#FFC107', '#8BC34A', '#4caf50'],
      // labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      feedback: null,
      loading: false
    }
  },
  methods: {
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
    }
  },
  mounted () {
    this.loading = true
    api.getFeedbackItem(this.feedbackId).then((result) => {
      this.loading = false
      // console.log(result)
      if (!result || result.length === 0) {
        this.error = true
      } else {
        this.feedback = result
        this.$nextTick(() => {
          let media = document.querySelector('#media')
          if (media) {
            this.calculateMediaDuration(media).then(() => {
              // console.log(media.duration)
            })
          }
        })
      }
    })
    document.addEventListener('deviceready', async () => {
      this.ready = true
      // console.log('ready')
    }, false)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import '~stylus/shared'
#event
  padding: 10px 30px
  #question
    text-align: center;
    width: 100%;
    font-size: 1.2rem;
    text-transform: lowercase;
    margin-bottom: 10px

video {
  max-width: 100%
}

.text-feedback.media
  font-weight: 500;
  font-size: 1.1rem;
  white-space: pre-wrap;
  padding: 30px;
  border-radius: 30px;
  background: #f2f3f4;
  max-width: 500px;
  margin: 0 auto;
  text-align: left

#status
  margin 20px
  font-style italic

#feedback, #chart
  background: #fafafa;
  border: 1px solid $border-light;
  padding: 10px;
  // border-radius: 10px;
  margin-bottom 10px

#feedback-data
  display flex
  flex-direction row
  justify-content space-between
  align-items center

  #date
    font-size: 0.85rem;
    color: $text-lt-gray;
    margin-bottom: 5px;
  // #rating
  //   margin: 0 0 0 10px;
  //   padding: 10px 10px;
  //   background: #f4f4f4;
  //   border-radius: 10px;
  //   display block;
  //   width: 25px;
  //   height: 25px;
  #rating
    margin: 0 0 0 10px;
    padding: 5px 10px;
    background: #f4f4f4;
    border-radius: 10px;
    display flex;
    // font-size: 12px;
    font-size: 0.95rem;
    font-weight bold;
    flex-direction: column
    justify-content center
    min-height 35px
    width: 25px;
    color: $text-light
#feedback-media
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

.description
  padding: 10px;
  font-size: 1.1rem;
  background: #fafafa;
  border: 1px solid $border-light;
  margin-bottom 10px
  // background: #cae9f7;
  // background: linear-gradient(180deg, #cae9f7, #fff);

.description >>> p
  font-size: 1.1rem;
  margin: 0 0 15px 0;
  img
    max-width: 100% !important

</style>
