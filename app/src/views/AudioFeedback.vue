<template lang="pug">
  #main
    #header-container
      Header
    #recording(v-show="!recorded")
      #microphone-icon
        font-awesome-icon(icon="microphone-alt")
        audio#broadcast(muted controls ref="broadcast" v-show="!stopped")
      #video-controls
        div(v-show="false")
          select#audioSource
        #vc-container
          .vc
            button#skip(v-show="stopped" @click="skip") Skip
          .vc
            #recording-btn-container
              button#recording-btn(@click="recordButtonAction" :disabled="shouldStop && !stopped" :class="{recording: !stopped}")
                font-awesome-icon(v-if="stopped" icon="circle")
                font-awesome-icon(v-if="!stopped" icon="stop")
          .vc(style='width: 60px')
    #recorded(v-show="recorded")
      audio#playback(autoplay controls :src="currentUrl")
      #playback-controls
        div#consent-container(v-if="!loading")
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
          button#upload(@click="uploadVideo" :disabled="!currentFile || !consented" ) Submit Feedback
          button#restart(@click="restart") Record Again
        #none(@click="skip" v-if="!loading")
          a Skip
        div(v-if="loading")
          Loader(:loading="loading")

</template>

<script>
import axios from 'axios'
import api from '@/api'
import Loader from '@/components/Loader'
import Header from '@/components/Header'
import MediaStreamRecorder from '@/scripts/MediaRecorder'

export default {
  name: 'AudioFeedback',
  props: ['feedbackId', 'sessionId'],
  components: { Loader, Header },
  methods: {
    consentChanged () {
      // console.log(this.$refs.consent)
      this.consented = this.$refs.consent.checked
    },
    getAudioType () {
      if (typeof MediaRecorder !== 'undefined') {
        return 'wav'
      } else {
        return 'wav'
      }
    },
    skip: function () {
      this.$router.replace({ name: 'thankyou', params: { sessionId: this.sessionId } })
    },
    getSignedRequest: function (file, result) {
      axios
        .get(`${this.$store.getters.instanceApi}/sign-s3?file-name=coronavoice/${encodeURIComponent(file.filename)}&file-type=${encodeURIComponent(file.type)}`)
        .then(response => {
          // console.log(response)
          this.uploadFile(file, response.data.signedRequest, response.data.url, result)
          this.uploadUrl = response.data.url
        })
    },
    uploadFile: function (file, signedRequest, url, result) {
      var options = {
        headers: {
          'Content-Type': file.type
        }
      }
      // console.log('file')
      // console.log(file)
      axios
        .put(signedRequest, file, options)
        .then(req => {
          // console.log(req.data)
          this.sendAnswer()
          return req.data
        })
        .catch(error => {
          // console.log(error.response)
          return { error: true, errorMessage: error.response }
        })
    },
    uploadVideo: function () {
      let file = this.blobToFile(this.currentFile, 'webm')
      this.getSignedRequest(file)
    },
    restart: function () {
      // console.log(this)
      document.querySelector('audio#playback').src = null
      this.currentFile = null
      this.currentBlob = null
      this.recorded = false
      this.currentUrl = null
      this.initAudioRecorder()
    },
    onDeviceReady: async function () {
      document.addEventListener('backbutton', this.onBackKeyDown, false)
      this.ready = true
      // console.log('ready')
      this.initAudioRecorder()
    },
    sendAnswer: function (blob) {
      this.loading = true
      // console.log('feedbackId: ' + this.feedbackId)
      api.submitMediaFeedback({
        feedbackId: this.feedbackId,
        type: 2,
        location: this.uploadUrl,
        consent_public: this.$refs.public.checked
      }).then(response => {
        this.loading = false
        this.$router.replace({ name: 'thankyou', params: { sessionId: this.sessionId } })
      })
    },
    initAudioRecorder: function () {
      this.audioSelect = document.querySelector('select#audioSource')
      navigator.mediaDevices.enumerateDevices().then(this.gotDevices).then(this.getStream).catch(this.handleError)
      this.audioSelect.onchange = this.getStream
    },
    gotDevices: function (deviceInfos) {
      // console.log(deviceInfos)
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i]
        const option = document.createElement('option')
        option.value = deviceInfo.deviceId
        if (deviceInfo.kind === 'audioinput') {
          option.text = deviceInfo.label ||
            'microphone ' + (this.audioSelect.length + 1)
          this.audioSelect.appendChild(option)
        }
      }
    },
    getStream: function () {
      if (window.stream) {
        window.stream.getTracks().forEach(function (track) {
          track.stop()
        })
      }
      const constraints = {
        audio: true
      }

      navigator.mediaDevices.getUserMedia(constraints).then(this.gotStream).catch(this.handleError)
    },
    onRecordingStop: function () {
      this.stopped = true
      // console.log('media stopped')
      this.currentFile = new Blob(this.recordedChunks, { name: `${Date.now()}-audio.${this.audioType}`, type: `audio/${this.audioType}` })

      // eslint-disable-next-line no-undef
      let tracks = stream.getTracks()
      tracks.forEach(function (track) {
        track.stop()
      })

      this.recorded = true
      this.currentUrl = URL.createObjectURL(this.currentFile, this.audioType)
      document.querySelector('audio#playback').src = this.currentUrl
    },
    gotStream: function (stream) {
      window.stream = stream
      // console.log('stream')
      // console.log(stream)
      this.audioType = this.getAudioType()
      const options = { mimeType: `audio/${this.audioType}` }
      this.recordedChunks = []
      this.mediaRecorder = new MediaStreamRecorder(stream, options)
      this.mediaRecorder.mimeType = `audio/${this.audioType}`
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.size > 0) {
          // console.log(e)
          this.recordedChunks.push(e)
          // console.log('media recording')
        }

        if (this.shouldStop === true && this.stopped === false && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop()
          this.stopped = true
          // console.log('media will stop')
        }
      }

      this.mediaRecorder.onstop = this.onRecordingStop
      window.mediaRecorder = this.mediaRecorder
      window.recordedChunks = this.recordedChunks
    },
    handleError: function (error) {
      console.error('Error: ', error)
      // console.log(error)
    },
    recordButtonAction: function () {
      // console.log(this.mediaRecorder)
      if (!this.mediaRecorder) return
      if (this.stopped) {
        this.stopped = false
        this.shouldStop = false
        // console.log('media should start')
        this.recordedChunks = []
        this.currentFile = null
        this.currentBlob = null
        this.mediaRecorder.start(10 * 60 * 1000)
        let audio = this.$refs.broadcast
        audio.muted = true
        // eslint-disable-next-line no-undef
        audio.srcObject = stream
        audio.play()
      } else {
        this.shouldStop = true
        // console.log('media should stop')
        this.mediaRecorder.stop()
      }
    },
    blobToFile: function (blob, extension) {
      blob.filename = Date.now() + '.' + extension
      blob.lastModifiedDate = Date.now()
      return blob
    },
    onBackKeyDown: function () {
      // console.log(this.$router)
      this.$router.go(-1)
    },
    leaving () {
      // console.log('leaving')
      if (window.stream) {
        window.stream.getTracks().forEach(function (track) {
          track.stop()
        })
      }
    }
  },
  beforeRouteLeave (to, from, next) {
    // console.log('beforeRouteLeave: HOME')
    this.leaving()
    next()
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
      public: false
    }
  },
  mounted () {
    window.addEventListener('beforeunload', this.leaving)
    this.onDeviceReady()
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
  #video-controls
    bottom: 70px !important
    position: fixed !important

#header-container
  display none

#main {
  background: #eee
}

#microphone-icon
  font-size: 20vh
  color: $button-gray
  padding: 20px

video {
  max-width: 100%
  -webkit-transform: scaleX(1);
  transform: scaleX(1);
}

#broadcast
  display: block;
  margin: 0 auto;

#playback
  margin-top: 20px
  margin-bottom: 20px

#playback-controls
  padding: 10px 20px;
  background: white

  #consent-container
    width: 100%
    max-width: 600px
    margin 0 auto
    label
      margin 10px auto
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
    font-weight 500
    color: $text-light;
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
    // border-radius: 10px;
    background: $button-lt-gray;
    color: $text-dark;
    font-weight 500
    width: 100%;
    border: none;
    flex: 1;
    max-width: 300px;
  #skip
    width: 100%
  a#skip
    cursor: pointer
  a#skip:hover
    text-decoration: underline;
  #none
    padding: 10px 30px;
    background: $button-lt-gray;
    border: 1px solid $border-light;
    margin: 10px auto;
    // border-radius: 10px;
    text-align: center;
    color: $button-primary;
    max-width: 610px;
    box-sizing: border-box

    a
      color: $button-primary;
      font-size: 1.3rem;
      display: block

#video-controls
    position: absolute;
    bottom: 55px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 10px 40px;
    align-items: center;
    text-align: center;
    justify-content: center;

  #vc-container
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    max-width: 500px;
    flex: 1;
    align-items: center;

  .vc
    flex: 0.3;

    button
      outline:none

    #skip
      padding: 10px 20px;
      font-size: 1.1rem;
      background: white;
      border: 2px solid #eee;
      border-radius: 50px;
      color: #666;
      font-weight: bold;

    #recording-btn
      width: 70px;
      height: 70px;
      border-radius: 100px;
      background: crimson;
      border: 2px solid white;
      color: white;
      text-align: center;
      font-size: 1.6rem;
      &.recording
        background: white;
        color: crimson;
      &:active
        background: darkred;
        color: white

    #recording-btn-container
      width: 70px;
      height: 70px;
      border-radius: 150px;
      background: white;
      padding: 3px;
      margin: auto;
      border: 3px solid #eee;

    #flip-camera
      width: 50px;
      height: 50px;
      border-radius: 100px;
      font-size: 1.1rem;
      color: #666;
      background: white;
      border: 2px solid #eee;

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin: 10px 0 !important;
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
