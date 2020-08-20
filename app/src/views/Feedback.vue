<template lang="pug">
  <PlainTemplate :title="event? `${event.event_name} - ${event.session_name}`: `Feedback`" back="true">
    <template v-slot:content>
      div(v-if="loading")
        Loader(:loading="loading")
      #intro-view(v-if="event && !feedbackSubmitted && intro" v-show="!loading")
        div.description(v-html="event.description")
        .proceed
          button(@click="skipIntro") Take Survey
          
      #question-view(v-if="event && !feedbackSubmitted && !intro" v-show="!loading")
        h3 {{ event.event_name }} - {{ event.session_name }}
          span
            router-link(:to="{name: 'event-details', params: {sessionId: sessionId}}" style="font-size: 0.85rem; text-decoration: underline; color: #00a499; margin-left: 5px;") (info)
        h2 {{ question }}
        #answer-buttons
          .likert-container
            .likert-10
              .likert-row(v-for="n in 10" :class="{selected: n==selectedFeedback}" @click="sendFeedback(n)")
                input(type="radio" :value="n" :id="`radio-${n}`" name="likert" v-model="selectedFeedback")
                label(:for="`radio-${n}`") {{ n }}
                  span(v-if="n==1")  - Worst
                  span(v-if="n==10")  - Best

        .submit
          button(@click="submitFeedback" :class="selectedFeedback ? '' : 'disabled'") Submit Feedback

      #follow-up(v-if="event && event.followup_enabled && feedbackSubmitted && !intro")
        h3 {{ event.event_name }} - {{ event.session_name }}
        //- h2 {{ event.followup_label }}
        div.description(v-html="event.followup_label" style="text-align: left; font-size: 1.5rem")
        #followup-options
          #text(@click="routeToText" v-if="extraFields.text")
            font-awesome-icon(icon="edit")
            a Text Feedback

          #audio(@click="routeToAudio" v-if="extraFields.audio")
            font-awesome-icon(icon="microphone-alt")
            a Audio Feedback

          #video-picker(v-if="isIOS() && extraFields.video")
            input(type="file" accept="video/*" capture="user" ref="file" @change="videoChanged")
          #video(@click="routeToVideo" v-if="extraFields.video")
            font-awesome-icon(icon="video")
            a Video Feedback

        #none(@click="skip")
          a Skip

      #thank-you(v-if="event && !event.followup_enabled && feedbackSubmitted && !intro")
        h2(style="margin: 5px") Thank you!
        #thanks-text(v-html="event.thanks_text")
        thanks(:sessionId="sessionId")
    </template>
  </PlainTemplate>
</template>

<script>
import api from '@/api'
import Thanks from '@/components/Thanks'
import Loader from '@/components/Loader'
import PlainTemplate from '@/components/PlainTemplate'
import 'vue-scroll-picker/dist/style.css'

export default {
  name: 'Feedback',
  props: ['sessionId'],
  components: {
    Thanks, Loader, PlainTemplate/* , ScrollSelector */
  },
  methods: {
    skipIntro: function () {
      this.intro = false
    },
    skip: function () {
      this.event.followup_enabled = false
    },
    isIOS () {
      if (/webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
    routeToText: function () {
      // console.log('to audio')
      this.$router.replace({ name: 'text-feedback', params: { sessionId: this.sessionId, feedbackId: this.feedbackId } })
    },
    routeToAudio: function () {
      // console.log('to audio')
      this.$router.replace({ name: 'audio-feedback', params: { sessionId: this.sessionId, feedbackId: this.feedbackId } })
    },
    routeToVideo: function () {
      // console.log('to video')
      if (!this.isIOS()) {
        this.$router.replace({ name: 'media-feedback', params: { sessionId: this.sessionId, feedbackId: this.feedbackId } })
      } else {
        this.startVideoPicker()
      }
    },
    startVideoPicker () {
      this.videoPicker = true
      this.$refs.file.click()
    },
    videoChanged () {
      if (this.$refs.file.files.length <= 0) return
      let file = this.$refs.file.files[0]
      this.$router.replace({ name: 'media-feedback', params: { sessionId: this.sessionId, feedbackId: this.feedbackId, videoFile: file } })
    },
    sendFeedback: function (feedback) {
      this.selectedFeedback = feedback
    },
    submitFeedback: async function () {
      if (!this.selectedFeedback) return
      let feedback = this.selectedFeedback
      // console.log(feedback)
      this.loading = true
      let feedbackResult = await api.submitFeedback({
        userId: this.$store.state.currentUser.userId,
        sessionId: this.sessionId,
        eventId: this.event.event_id,
        rating: feedback
      })
      this.loading = false
      this.feedbackId = feedbackResult.feedbackId
      this.feedbackSubmitted = true
      // this.$router.replace({ name: 'media-feedback', params: { sessionId: this.sessionId, feedbackId: feedbackResult.feedbackId } })
    }
  },
  data () {
    return {
      question: "How was today's session?",
      event: null,
      error: false,
      feedbackSubmitted: false,
      feedbackId: null,
      ratings: null,
      datacollection: { },
      people: 0,
      selectedFeedback: null,
      loading: false,
      videoPicker: false,
      extraFields: { },
      intro: true
    }
  },
  mounted () {
    this.loading = true
    api.getSessionEvent(this.sessionId).then((result) => {
      this.loading = false
      if (!result || result.length === 0) {
        this.error = true
        this.$router.replace({ name: 'home' })
      } else {
        this.event = result[0]
        if (!this.event.description) {
          this.intro = false
        }
        if (this.event.event_status !== 1 || this.event.session_status !== 1) {
          this.$router.replace({ name: 'event-details', params: { sessionId: this.sessionId } })
          return
        }
        this.question = this.event.question
        this.extraFields = JSON.parse(this.event.extra_fields || '{}')
        if (this.event.followup_enabled) {
          if (!this.event.extra_fields || this.event.extra_fields === '{}') {
            this.extraFields.video = true
            this.extraFields.audio = true
            this.extraFields.text = true
          } else {
            this.extraFields.video = this.editedEvent.extraFields.video
            this.extraFields.audio = this.editedEvent.extraFields.audio
            this.extraFields.text = this.editedEvent.extraFields.text
          }
        } else {
          this.extraFields.video = false
          this.extraFields.audio = false
          this.extraFields.text = false
        }
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

@media screen and (min-device-aspect-ratio: 3072/4096)

  #answer-buttons
    // flex-wrap wrap

    .likert-10
      flex-direction: column;

    .likert-row
      flex-direction: row;
      width: 100%;
      padding: 10px 10px;
      font-weight: normal;
      font-size: 1.2rem;

    label
      margin: 0 10px 0 10px;
      padding: 0;
      text-align: left;

    input
      margin: 0 10px 0 10px;
      width: auto;

  #intro-view
    background: $body-background !important;

@media screen and (max-device-aspect-ratio: 3071/4096)
  #answer-buttons
    // flex-wrap wrap

    .likert-10
      flex-direction: column;

    .likert-row
      flex-direction: row;
      width: 100%;
      padding: 10px 10px;
      font-weight: normal;
      font-size: 1.2rem;

    label
      margin: 0 10px 0 10px;
      padding: 0;
      text-align: left;

    input
      margin: 0 10px 0 10px;
      width: auto;

#main {
  // padding-top: 68px;
}

#followup-options
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;

#title
  text-align: center;
  width: 100%;
  font-size: 1.6rem;
  text-transform: uppercase;
  color: $accent;
  letter-spacing: 0.05em;

#video-picker
  position absolute
  top: -200px

#answer-buttons {
  padding: 20px;
  display: flex;
  flex-direction row;
  justify-content: center;

  #instructions {
    text-align center
    margin-top 10px
    font-size 0.9em
    color: #777
  }

  .likert-container {
    display: flex;
    flex-direction: row;
    box-shadow: 1px 1px 9px 1px #dadada
    background: $body-background
  }

  .labels {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 20px;
    box-sizing: content-box;
    font-size: 1rem;
    font-weight: 500;
    max-width: 160px;
  }

  .likert-10 {
    padding: 0 0px;
    text-align: left;
    // box-shadow: 1px 1px 9px 1px #dadada
    display: flex;
    min-width: 100px;

      .likert-row {
        display: flex;
        align-items: center;
        border: 1px solid $border-light;
        box-sizing: border-box;
        color: $text-dark;

        label {
          flex: 1;
        }

        &.selected {
          background: $button-primary;
          color: $text-light;
          font-weight: bold;
        }
      }
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    flex: 1
    min-width: 280px
    justify-content: space-around;

    a {
      display: block;
    text-decoration: none;
    flex 1;
    padding: 30px 30px;
    -ms-flex: 0.5;
    flex: 0.5;
    /* font-size: 5rem; */
    max-width: 30%
    margin: 10px;
    border-radius: 10px;
    border: 0;
    background: #F7F7F7;
    box-shadow: 1px 1px 9px 1px #dadada
    }

    .selected {
      background: currentColor
    }
  }
}

#follow-up
  padding 10px 30px
  #video, #audio, #text
    padding: 30px;
    background: $button-primary;
    border: 1px solid $border-primary;
    margin: 10px;
    // border-radius: 10px;
    font-size: 2rem;
    text-align: center;
    color: $text-light;
    flex: 1;
    min-width: 120px;
    a
      margin-top: 10px
      color: $text-light;
      font-size: 1.3rem;
      display: block

  #none
    padding: 20px 30px;
    background: $button-lt-gray;
    border: 1px solid $border-light ;
    margin: 10px;
    // border-radius: 10px;
    text-align: center;
    color: $button-primary;
    a
      color: $button-primary;
      font-size: 1.3rem;
      display: block

.submit, .proceed
  padding: 10px 30px;

  button
    display: block;
    margin: 10px auto;
    font-size: 1.2rem;
    padding: 15px 30px;
    // border-radius: 10px;
    background: $button-primary;
    color: $text-light;
    width: 100%;
    border: none;
    font-weight: 500
    box-shadow: 1px 1px 9px 1px #dadada;

  .disabled
    background: lightgray

#intro-view, #question-view
  background: #cae9f7;
  background: linear-gradient(180deg, $cloud, $body-background);
  padding: 0 0 10px 0;

#question-view
  h3
    margin: 0
    padding: 15px;

.description
  padding: 10px 20px;
  font-size: 1.1rem;
  // background: #cae9f7;
  // background: linear-gradient(180deg, #cae9f7, #fff);

.description >>> p
  font-size: 1.1rem;
  margin: 0 0 15px 0;
  img
    max-width: 100% !important

</style>
