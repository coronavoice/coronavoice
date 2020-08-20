<template lang="pug">
  <PlainTemplate title="Details" back="true">
    <template v-slot:content>
    #event(v-if="loading")
      Loader(:loading="loading")
    #event(v-if="!loading && feedback")
      h3#name {{ feedback.event_name }} - {{ feedback.session_name }}
      #question {{ feedback.question }}
      #status This survey
        span(style="font-weight: bold")  {{ ['is finished', 'is currently ongoing', 'is under analysis'][feedback.session_status] }}

      #chart
        h4 Results
        thanks(:sessionId="feedback.session_id")
    </template>
  </PlainTemplate>
</template>

<script>
import api from '@/api'
import Thanks from '@/components/Thanks'
import Loader from '@/components/Loader'
import PlainTemplate from '@/components/PlainTemplate'

export default {
  name: 'EventDetails',
  props: [ 'sessionId' ],
  components: {
    Thanks, PlainTemplate, Loader
  },
  data () {
    return {
      feedback: null,
      loading: true
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
    this.ready = true
    this.loading = true
    // console.log('ready')
    api.getSessionEvent(this.sessionId).then((result) => {
      // console.log(result)
      this.loading = false
      if (!result || result.length === 0) {
        this.error = true
      } else {
        this.feedback = result[0]
        // console.log(this.feedback)
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
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
#event-details{
  padding-top: 68px;
}

#event
  padding: 10px 30px
  #question
    text-align: center;
    width: 100%;
    font-size: 1.2rem;
    text-transform: lowercase;
    margin-bottom: 10px

#status
  margin 20px
  font-style italic

#chart
  background: #fafafa;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 10px;
  margin-bottom 10px

</style>
