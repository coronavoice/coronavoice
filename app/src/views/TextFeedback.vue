<template lang="pug">
  <PlainTemplate title="Text">
    <template v-slot:content>
      #playback-controls
        #text-field
          //- h2 {{ question }}
          div(v-html="question" style="font-size: 1.2rem; text-align: left;")
          textarea(placeholder="Write your feedback..." v-model="textFeedback")
        div#consent-container
          label(for="consent")
            input(name="consent" id="consent" type="checkbox" ref="consent" @change="consentChanged")
            span I have read and agreed to the
              a(href="/#/privacy" target="_blank")  Privacy Policy
              |  and
              a(href="/#/terms" target="_blank")  Terms of Use
          .toggle-row
            div Could this feedback be shared publicly and used for research purposes?
            .toggle-element
              div#no.answer.public(:class="{selected: !public}") No
              label.switch(for="public")
                input(name="public" id="public" type="checkbox" ref="public" v-model="public")
                span.slider
              div#yes.answer.public(:class="{selected: public}") Yes
        div#pb-container(v-if="!loading")
          button#upload(@click="sendAnswer" :disabled="!textFeedback || !textFeedback.trim() || !consented" ) Submit Feedback
        #none(@click="skip" v-if="!loading")
          a Skip
        div(v-if="loading")
          Loader(:loading="loading")
    </template>
  </PlainTemplate>
</template>

<script>
import api from '@/api'
import Loader from '@/components/Loader'
import Header from '@/components/Header'
import PlainTemplate from '@/components/PlainTemplate'

export default {
  name: 'TextFeedback',
  props: ['feedbackId', 'sessionId'],
  components: { Loader, Header, PlainTemplate },
  methods: {
    consentChanged () {
      // console.log(this.$refs.consent)
      this.consented = this.$refs.consent.checked
    },
    onDeviceReady: async function () {
      document.addEventListener('backbutton', this.onBackKeyDown, false)
      this.ready = true
      // console.log('ready')
    },
    sendAnswer: function () {
      this.loading = true
      // console.log('feedbackId: ' + this.feedbackId)
      api.submitMediaFeedback({
        feedbackId: this.feedbackId,
        type: 4,
        consent_public: this.$refs.public.checked,
        text_feedback: this.textFeedback.trim()
      }).then(response => {
        this.loading = false
        this.$router.replace({ name: 'thankyou', params: { sessionId: this.sessionId } })
      })
    },
    onBackKeyDown: function () {
      // console.log(this.$router)
      this.$router.go(-1)
    },
    skip: function () {
      this.$router.replace({ name: 'thankyou', params: { sessionId: this.sessionId } })
    }
  },
  data () {
    return {
      question: "How was today's session?",
      videoElement: null,
      audioSelect: null,
      videoSelect: null,
      shouldStop: true,
      stopped: true,
      mediaRecorder: null,
      recordedChunks: [],
      storageLocation: '',
      currentFile: null,
      currentBlob: null,
      recorded: false,
      currentUrl: null,
      uploadUrl: null,
      loading: false,
      audioType: 'webm',
      consented: false,
      event: {},
      textFeedback: null,
      public: false
    }
  },
  mounted () {
    this.onDeviceReady()
    this.loading = true
    api.getSessionEvent(this.sessionId).then((result) => {
      this.loading = false
      if (!result || result.length === 0) {
        this.error = true
        this.$router.replace({ name: 'home' })
      } else {
        this.event = result[0]
        this.question = this.event.followup_label
      }
    })
    document.addEventListener('deviceready', async () => {
      this.ready = true
      // console.log('ready')
    }, false)
  }
}
</script>
<style lang="stylus">
#app {
  padding-bottom: 0
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import '~stylus/shared'

@media screen and (min-device-aspect-ratio: 3072/4096)
  #header-container
    display block !important
  #main
    padding-top: 68px

#header-container
  display none

#microphone-icon
  font-size: 20vh
  color: $button-gray
  padding: 20px

video {
  max-width: 100%
  -webkit-transform: scaleX(1);
  transform: scaleX(1);
}

#text-field
  textarea
    width: 78%;
    min-height: 300px;
    border: 1px solid #ccc;
    resize: vertical;
    font-size: 1.2rem;
    padding: 10px;
#broadcast
  display: block;
  margin: 0 auto;

#playback
  margin-top: 20px
  margin-bottom: 20px

#playback-controls
  padding: 10px 20px;
  background: $body-background

  #consent-container
    width: 80%
    // max-width: 600px
    margin 0 auto
    label
      margin 10px 0
      display block
      text-align left
      span
        margin-left: 10px

  #pb-container
    display: flex
    flex-direction: row
    flex-wrap: wrap
    justify-content center
    &>button
      min-width 150px
      margin: 0 5px 10px 5px

  #upload
    display: block;
    margin: 10px auto;
    font-size: 1.2rem;
    padding: 15px 30px;
    // border-radius: 10px;
    background: $button-primary;
    color: $text-light;
    font-weight 500
    width: 100%;
    border: none;
    flex: 1;
    max-width: 300px;

    &:disabled
      background #777
      color #555

  #restart
    display: block;
    margin: 10px auto;
    font-size: 1.2rem;
    padding: 15px 30px;
    border-radius: 10px;
    background: $button-lt-gray;
    color: $text-gray;
    width: 100%;
    border: none;
    flex: 1;
    max-width: 300px;
  #skip
    width: 100%

#none
  padding: 10px 30px;
  background: $button-lt-gray;
  border: 1px solid $border-light;
  margin: 10px auto;
  // border-radius: 10px;
  text-align: center;
  color: $button-primary;
  max-width: 300px;
  box-sizing: border-box

  a
    color: $button-primary;
    font-size: 1.3rem;
    display: block

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
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {display:none;}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f44336;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;
  margin: 0 !important;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4caf50;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4caf50;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.toggle-row {
  text-align: left;
  margin 20px 0
}

.toggle-element {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .answer.public {
    margin: 5px;
    min-width: 50px;
    text-align: center;
    font-size: 1rem;
    font-weight: bold
    color: #778594
  }

  .answer.public.selected {
    color: #2c3e50
  }
}
</style>
