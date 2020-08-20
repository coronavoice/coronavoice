<template  lang="pug">
  <CloudTemplate title="Surveys">
    <template v-slot:content>
      div
        #events-view(v-if="loading")
          Loader(:loading="loading")
        #events-view(v-if="!loading && events")
          h3 Available Surveys
          .row
            #subtitle Select one of the surveys below to give your feedback
          #event(v-for="event in events.availableEvents")
            router-link#current(:to="{name: 'event', params: {sessionId: event.session_id}}") {{ event.event_name }} - {{ event.session_name }}
          h3 Past Surveys
          #event(v-for="event in events.pastEvents")
            router-link#past(:to="{name: 'event-details', params: {sessionId: event.session_id}}") {{ event.event_name }} - {{ event.session_name }}
    </template>
  </CloudTemplate>
</template>

<script>
import api from '@/api'
import Loader from '@/components/Loader'
import CloudTemplate from '@/components/CloudTemplate'

export default {
  name: 'EventList',
  methods: {
  },
  components: {
    Loader, CloudTemplate
  },
  data () {
    return {
      events: null,
      error: false,
      loading: true
    }
  },
  mounted () {
    api.getUserEvents(this.$store.state.currentUser.userId).then((result) => {
      this.loading = false
      if (!result || result.length === 0) {
        this.error = true
      } else {
        this.events = result
      }
    })
    document.addEventListener('deviceready', async () => {
      this.ready = true
      // console.log('ready')
    }, false)
  }
}
</script>
<style scoped lang="stylus">
@import '~stylus/shared'

.row
  display: flex;
  text-align: center;
  padding: 1px;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -ms-flex-direction: row;
  flex-direction: row;

  #title
    text-align: center;
    width: 100%;
    font-size: 1.6rem;
    text-transform: uppercase;
    /* font-weight: bold; */
    color: $accent;
    letter-spacing: 0.05em;

  #subtitle
    text-align: center;
    width: 100%;
    font-size: 1rem;
    font-weight: lighter;
    text-transform: lowercase;
    letter-spacing: 0.1rem;
    margin-bottom: 10px

  input
    margin: 20px auto 10px auto;
    padding: 10px 1px;
    border: none;
    border-bottom: 1px solid $primary;
    font-size: 1rem;
    color: $text-gray;
    width: 90%;

  button
    font-size: 12pt;
    margin: 0 auto;
    border-radius: 10px;
    border: none;
    padding: 10px 30px;
    background-color: $text-light;
    background: $secondary;
    color: $text-light;
    /* text-transform: uppercase; */
    font-weight: bold;
    font-size: 1rem;

  a
    display: block;
    text-decoration: none;
    padding: 30px 20px 15px 20px;
    flex: 0.5;
    font-size: 5rem;
    margin: 5px;
    border-radius: 10px;

#event
  padding: 5px 10px
  router-link
    width: 100%
    text-align center
    padding: 15px 30px;
    // border-radius: 10px;
    display: block;
    /* background: #E7EFEE; */
    margin: 2px;
    text-decoration: none;
    font-size: 1.1rem;
    &#current
      background: $button-secondary;
      color: $text-light;
    &#past
      background: $button-lt-gray;
      color: $text-gray;
  a
    text-align center
    padding: 15px 30px;
    // border-radius: 10px;
    display: block;
    /* background: #E7EFEE; */
    margin: 2px;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 500;
    &#current
      background: $button-secondary;
      color: $text-light;
    &#past
      background: $button-lt-gray;
      color: $text-gray;

</style>
