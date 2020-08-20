<template  lang="pug">
  <CloudTemplate title="Admin Panel" back="true">
    <template v-slot:content>
      div
        #events-view(v-if="loading")
          Loader(:loading="loading")
        #events-view
          .heading
            h3 Surveys
            #edit-event
              #edit( @click="addEvent") Add Survey
          #event(v-if="!loading && events" v-for="event in events")
            router-link#current(:to="{name: 'admin-event-details', params: {eventId: event.event_id}}") {{ event.name }}
    </template>
  </CloudTemplate>
</template>

<script>
import api from '@/api'
import Loader from '@/components/Loader'
import CloudTemplate from '@/components/CloudTemplate'

export default {
  name: 'AdminEvents',
  methods: {
    addEvent () {
      this.$router.push({ name: 'admin-add-event' })
    }
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
    api.getAdminEvents().then((result) => {
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

.heading
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding 0 15px
    box-sizing: border-box
  h3, h4
    flex: 1
    text-align: left
#edit-event
  margin 0 auto
  display: flex
  flex-direction row
  justify-content center
#edit
  // border-radius 10px
  padding 10px 15px
  background $button-primary
  color $text-light
  font-weight: bold
  cursor pointer
  margin: 2px

#event
  padding: 5px 10px
  router-link
    width: 100%
    text-align center
    padding: 15px 30px;
    border-radius: 10px;
    display: block;
    /* background: #E7EFEE; */
    margin: 2px;
    text-decoration: none;
    font-size: 1.1rem;
    &#current
      background: $button-secondary;
      color: $text-light

  a
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
      color: $text-light

</style>
