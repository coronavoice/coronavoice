<template lang="pug">
  <CloudTemplate back="true" title="Feedback History">
    <template v-slot:content>
      div
        #events-view(v-if="loading")
          Loader(:loading="loading")
        #events-view(v-if="feedback" v-show="!loading")
          .event(v-for="event in feedback" @click="viewFeedback(event.feedback_id)")
            .event-data
              .ev-name {{ event.event_name }} - {{ event.session_name }}
              .ev-status
                span(style="font-weight: bold") Status:
                span   {{ ['finished', 'ongoing', 'under analysis'][event.session_status] }}
              .ev-date {{ event.date_created | moment('M/D/YYYY, hh:mma' ) }}
            .event-icons
              //- img.ev-rating( v-if="event.rating" :src="ratingImg[event.rating-1]" :alt="event.rating-1" :style="{'background-color': ratingColor[event.rating-1]}")
              .ev-rating( v-if="event.rating" :alt="event.rating-1" :style="{'background-color': ratingColor}") {{ event.rating }}
              //- .ev-rating( v-if="event.rating" :alt="event.rating-1" :style="{'background-color': ratingColor[event.rating-1]}") {{labels[event.rating-1]}}
              .ev-media(v-if="event.extra_feedback_type == 2")
                font-awesome-icon(icon="microphone-alt")
              .ev-media(v-if="event.extra_feedback_type == 3")
                font-awesome-icon(icon="video")
              .ev-media(v-if="event.extra_feedback_type == 4")
                font-awesome-icon(icon="edit")
    </template>
  </CloudTemplate>
</template>

<script>
import api from '@/api'
import image1 from '@/assets/5.svg'
import image2 from '@/assets/6.svg'
import image3 from '@/assets/7.svg'
import image4 from '@/assets/8.svg'
import Loader from '@/components/Loader'
import CloudTemplate from '@/components/CloudTemplate'

export default {
  name: 'FeedbackHistory',
  components: {
    Loader, CloudTemplate
  },
  methods: {
    viewFeedback: function (feedbackId) {
      // console.log(feedbackId)
      this.$router.push({ name: 'feedback', params: { feedbackId: feedbackId } })
    },
    goBack: function () {
      this.$router.go(-1)
    }
  },
  data () {
    return {
      feedback: null,
      error: false,
      rating: [image1, image2, image3, image4],
      ratingImg: [image1, image2, image3, image4],
      // ratingColor: ['#f44336', /* '#f1812f',  */'#FFC107', '#8BC34A', '#4caf50'],
      ratingColor: '#8BC34A',
      // labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false
    }
  },
  mounted () {
    this.loading = true
    api.getFeedbackHistory().then((result) => {
      this.loading = false
      // console.log(result)
      if (!result || result.length === 0) {
        this.error = true
      } else {
        this.feedback = result
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

.event
  display: flex
  flex-direction row
  justify-content space-between
  align-items center
  padding 10px 10px
  margin-bottom: 10px
  background: #fafafa;
  border: 1px solid $border-light;
  &:active
    background: $border-light
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
  // .ev-rating
  //   margin: 0 0 0 10px;
  //   padding: 10px 10px;
  //   background: #f4f4f4;
  //   // border: 1px solid #ddd;
  //   border-radius: 10px;
  //   display block;
  //   width: 25px;
  //   height: 25px;
  .ev-rating
    margin: 0 0 0 10px;
    padding: 5px 10px;
    color: $text-light;
    background: #f4f4f4;
    // border: 1px solid #ddd;
    border-radius: 10px;
    display flex;
    font-size: 0.95rem;
    // font-size: 12px;
    flex-direction: column
    justify-content center
    min-height 35px
    width: 25px;
    font-weight bold;
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

#header
  position: fixed;
  background: $secondary;
  color: $text-light;
  left: 0;
  right: 0;
  top: 0;
  height: 54px;
  padding-top: 4px
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: row;
  flex-direction: row;
  z-index: 101
  #back
    font-size: 1.2rem
    padding: 16px 10px 15px 20px;
  #fc
    flex: 1
  a
    color: $text-light
  #logo
    padding: 10px 5px;
    line-height: 32px;
    font-size: 1.2rem;
    letter-spacing: 0.1rem;
</style>
