<template lang="pug">
  #main
    #header-container
      Header
    #recording(v-show="!recorded" v-if="(!isIOS() && !videoFile) && !isDesktopSafari()")
      video#record(autoplay playsinline muted v-if="!recorded" style="pointer-events: none")
      device(type="media" onchange="update(this.data)")
      #video-controls
        #vc-container
          .vc
            button#skip(v-show="stopped" @click="skip") Skip
          .vc
            #recording-btn-container
              button#recording-btn(@click="recordButtonAction" :disabled="shouldStop && !stopped" :class="{recording: !stopped}")
                font-awesome-icon(v-if="stopped" icon="video")
                font-awesome-icon(v-if="!stopped" icon="stop")
          .vc
            button#flip-camera(v-show="stopped" @click="flipCamera")
              font-awesome-icon(icon="sync")
    #recording(v-show="!recorded" v-if="(videoFile || isIOS()) && !isDesktopSafari()")
      #video-picker
        input(type="file" accept="video/*" capture="user" ref="videoFile" @change="videoChanged")
      video#playback(autoplay controls :src="currentUrl" v-show="currentUrl")
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
        div(v-if="loading")
          Loader(:loading="loading")
        div#pb-container(v-if="!loading")
          button#upload(@click="uploadVideo" :disabled="!currentFile || !consented" ) Submit Feedback
          button#restart(@click="$refs.videoFile.click()") Record Again
        #none(@click="skip" v-if="!loading")
          a Skip
    #recorded(v-if="recorded  && !isDesktopSafari() && (!isIOS() && !videoFile)")
      video#playback(autoplay controls :src="currentUrl")
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
        div(v-if="loading")
          Loader(:loading="loading")
        div#pb-container(v-if="!loading")
          button#upload(@click="uploadVideo" :disabled="!currentFile || !consented" ) Submit Feedback
          button#restart(@click="restart") Record Again
        #none(@click="skip" v-if="!loading")
          a Skip
    #error(v-if="isDesktopSafari()")
      p Sorry, this browser does not support recording video
      #none(@click="skip" v-if="!loading")
        a Skip

</template>
<script>
import axios from 'axios'
import api from '@/api'
import Loader from '@/components/Loader'
import Header from '@/components/Header'
import RecordRTC from 'recordrtc/RecordRTC.js'

export default {
  name: 'MediaFeedback',
  props: ['feedbackId', 'sessionId', 'videoFile'],
  components: { Loader, Header },
  methods: {
    isDesktopSafari () {
      const uA = navigator.userAgent
      const vendor = navigator.vendor
      if (this.desktopSafari || (/Safari/i.test(uA) && /Apple Computer/.test(vendor) && !/Mobi|Android/i.test(uA))) {
        return true
      }
      return false
    },
    videoChanged () {
      if (this.$refs.videoFile.files.length <= 0) return
      let oldUrl = this.currentUrl
      URL.revokeObjectURL(oldUrl)
      // console.log(this.$refs.videoFiles)
      this.currentUrl = URL.createObjectURL(this.$refs.videoFile.files[0])
      this.currentFile = this.$refs.videoFile.files[0]
      document.querySelector('video#playback').src = this.currentUrl
    },
    onRecordingStopped () {
      this.stopped = true
      // console.log('media stopped')
      this.currentFile = this.blobToFile(this.mediaRecorder.getBlob(), 'webm')
      // // console.log(this.currentFile)
      let tracks = window.stream.getTracks()
      tracks.forEach(function (track) {
        track.stop()
      })
      document.querySelector('#record').srcObject = null

      this.recorded = true
      this.currentUrl = URL.createObjectURL(this.mediaRecorder.getBlob(), 'webm')
      document.querySelector('video#playback').src = this.currentUrl
    },
    isIOS () {
      if (/webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
    consentChanged () {
      // console.log(this.$refs.consent)
      this.consented = this.$refs.consent.checked
    },
    update (stream) {
      // console.log('update')
      document.querySelector('video').src = window.stream.url
    },
    skip: function () {
      this.$router.replace({ name: 'thankyou', params: { sessionId: this.sessionId } })
    },
    getSignedRequest: function (file, result) {
      axios
        .get(`${this.$store.getters.instanceApi}/sign-s3?file-name=v2/${encodeURIComponent(file.filename || file.name)}&file-type=${encodeURIComponent(file.type)}`)
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
      this.getSignedRequest(this.currentFile)
    },
    restart: function () {
      // console.log(this)
      document.querySelector('video#playback').src = null
      this.currentFile = null
      this.currentBlob = null
      this.recorded = false
      this.currentUrl = null
      this.initVideoRecorder()
    },
    onDeviceReady: async function () {
      // console.log(navigator)
      document.addEventListener('backbutton', this.onBackKeyDown, false)
      this.ready = true
      // console.log('ready')
      if (!this.isIOS() && !this.isDesktopSafari()) {
        this.initVideoRecorder()
      }
    },
    sendAnswer: function (blob) {
      // console.log('feedbackId: ' + this.feedbackId)
      this.loading = true
      api.submitMediaFeedback({
        feedbackId: this.feedbackId,
        type: 3,
        location: this.uploadUrl,
        consent_public: this.$refs.public.checked
      }).then(response => {
        this.loading = false
        this.$router.replace({ name: 'thankyou', params: { sessionId: this.sessionId } })
      })
    },
    initVideoRecorder: function () {
      this.videoElement = document.querySelector('#record')
      navigator.mediaDevices.enumerateDevices().then(this.gotDevices).then(this.getStream).catch(this.handleError)
    },
    gotDevices: function (deviceInfos) {
      // console.log(deviceInfos)
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i]
        const option = document.createElement('option')
        option.value = deviceInfo.deviceId
      }
    },
    getStream: function () {
      if (window.stream) {
        window.stream.getTracks().forEach(function (track) {
          track.stop()
        })
      }
      const constraints = {
        audio: true,
        video: {
          facingMode: this.facingModeUser ? 'user' : 'environment',
          width: { ideal: 640 }
        }
      }
      navigator.mediaDevices.getUserMedia(constraints).then(this.gotStream).catch(this.handleError)
    },
    gotStream: function (stream) {
      window.stream = stream
      // console.log(stream)
      const options = { type: 'video' }
      this.recordedChunks = []
      try {
        this.mediaRecorder = new RecordRTC(stream, options)

        this.mediaRecorder.ondataavailable = function (e) {
          // if (e.data.size > 0) {
          //   console.log(e)
          //   this.recordedChunks.push(e.data)
          //   console.log('media recording')
          // }

          // if (this.shouldStop === true && this.stopped === false && this.mediaRecorder.state !== 'inactive') {
          //   this.mediaRecorder.stop()
          //   this.stopped = true
          //   console.log('media will stop')
          // }
        }

        this.mediaRecorder.onstop = function () {
          this.stopped = true
          // console.log('media stopped')
          this.currentFile = this.blobToFile(new Blob(this.recordedChunks, { name: `${Date.now()}-video.webm`, type: 'video/webm' }), 'webm')
          // console.log(this.currentFile)
          // this.getFileSystem(this.currentFile)
          // this.getSignedRequest(this.currentFile)
          let tracks = window.stream.getTracks()
          tracks.forEach(function (track) {
            track.stop()
          })
          document.querySelector('#record').srcObject = null

          this.recorded = true
          this.currentUrl = URL.createObjectURL(new Blob(this.recordedChunks, { name: `${Date.now()}-video.webm`, type: 'video/webm' }), 'webm')
          document.querySelector('video#playback').src = this.currentUrl
        }
        window.mediaRecorder = this.mediaRecorder
        window.recordedChunks = this.recordedChunks

        let videoStream = new MediaStream(stream.getVideoTracks())
        document.querySelector('#record').srcObject = videoStream
        // let videoRes = { height: stream.getVideoTracks()[0].getSettings().height, width: stream.getVideoTracks()[0].getSettings().width }
        // console.log(videoRes)
      } catch (e) {
        // console.log(e)
        this.desktopSafari = true
      }
    },
    writeFile: function (fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter((fileWriter) => {
        fileWriter.onwriteend = () => {
          // console.log('Successful file write...')
          // console.log(fileEntry)
          this.currentBlob = fileEntry.nativeURL
          this.readFile(fileEntry)
        }
        fileWriter.onerror = function (e) {
          // console.log('Failed file write: ' + e.toString())
        }

        if (!dataObj) {
          dataObj = new Blob(['some file data'], { type: 'text/plain' })
        }
        fileWriter.write(dataObj)
      })
    },
    getFileSystem: function (file) {
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, (fs) => {
        var dirEntry
        var fileName
        // console.log('file system open: ' + fs.name)
        fileName = file.filename
        dirEntry = fs.root
        return dirEntry.getFile(fileName, {
          create: true,
          exclusive: false
        }, (fileEntry) => {
          return this.writeFile(fileEntry, file) // writeFile is a method that would write blob into initialized temp storage.
        }, (e) => console.log(e))
      }, (e) => console.log(e))
    },
    readFile: function (fileEntry) {
      fileEntry.file((file) => {
        var reader = new FileReader()
        var getSignedRequest = this.getSignedRequest
        reader.onloadend = function () {
          // console.log('Successful file read: ' + this.result)
          getSignedRequest(file, this.result)
        }
        reader.readAsText(file)
      }, (e) => console.log(e))
    },
    handleError: function (error) {
      console.error('Error: ', error)
      // console.log(error)
    },
    recordButtonAction: function () {
      try {
        if (!this.mediaRecorder) return
        if (this.stopped) {
          this.stopped = false
          this.shouldStop = false
          // console.log('media should start')
          this.recordedChunks = []
          this.currentFile = null
          this.currentBlob = null
          this.mediaRecorder.startRecording()
        } else {
          this.shouldStop = true
          // console.log('media should stop')
          this.mediaRecorder.stopRecording(this.onRecordingStopped)
        }
      } catch (e) {
        this.desktopSafari = true
      }
    },
    flipCamera: function () {
      if (!this.mediaRecorder) return
      if (this.stopped) {
        this.recordedChunks = []
        this.currentFile = null
        this.currentBlob = null
        this.recorded = false
        this.currentUrl = null
        this.facingModeUser = !this.facingModeUser
        this.initVideoRecorder()
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
  watch: {
    videoFile: {
      handler: function (val, oldVal) {
        this.currentFile = val
        this.currentUrl = URL.createObjectURL(this.currentFile)
      },
      deep: true
    }
  },
  data () {
    return {
      question: "How was today's session?",
      videoElement: null,
      shouldStop: true,
      stopped: true,
      mediaRecorder: null,
      recordedChunks: [],
      storageLocation: '',
      currentFile: this.videoFile,
      currentBlob: null,
      recorded: false,
      currentUrl: null,
      uploadUrl: null,
      facingModeUser: true,
      loading: false,
      consented: false,
      desktopSafari: false,
      public: false
    }
  },
  mounted () {
    window.addEventListener('beforeunload', this.leaving)
    this.onDeviceReady()
    if (this.currentFile) {
      this.currentUrl = URL.createObjectURL(this.currentFile)
    }
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

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: $primary;
}

#main {
  padding-bottom: 74px;
}

video#record {
  max-width: 100vw;
  width: 100vw;
  max-height: calc(100vh - 54px);
}

#playback
  max-width: 100vw;
  max-height: 60vh
  // z-index: -100
#record
  transform: scaleX(-1)

#recording
  background: black

#video-picker
  position absolute
  top: -200px

#error
  font-size: 1.6em;
  padding: 50px 20px;
  color: #777
  font-weight: 500

  #skip
    display: block;
    margin: 10px auto;
    margin-top: 30px;
    font-size: 1.2rem;
    padding: 15px 30px;
    border-radius: 10px;
    background: $button-primary;
    color: white;
    border: none;
    width: 300px;

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
  #skip
    width: 100%

#none
  padding: 10px 30px;
  background: $button-lt-gray;
  border: 1px solid $border-light;
  margin: 10px 5px;
  // border-radius: 10px;
  text-align: center;
  color: $button-primary;
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
