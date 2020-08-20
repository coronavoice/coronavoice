<template lang="pug">
  <PlainTemplate :title="`${events[0].event_name} - Survey Details`" back="true">
    <template v-slot:tabs>
      .tab(@click="selectTab(1)" :class='{selected: selectedTab == 1}') Feedback Results
      .tab(@click="selectTab(2)" :class='{selected: selectedTab == 2}') Feedback Media
      .tab(@click="selectTab(3)" :class='{selected: selectedTab == 3}') Settings
    </template>
    <template v-slot:content>
      <div>
      #event(v-if="loading")
        Loader(:loading="loading")
      #event(v-if="events && !loading")
        AdminCharts(:eventId='eventId' v-bind:events='events' v-if="selectedTab == 1")
        AdminMedia(:eventId='eventId' v-bind:events='events' v-if="selectedTab == 2")
        AdminSessions(v-model='events' v-if="selectedTab == 3")
      </div>
    </template>
  </PlainTemplate>
</template>

<script>
import api from '@/api'
import Loader from '@/components/Loader'
import AdminSessions from '@/components/AdminSessions'
import AdminCharts from '@/components/AdminCharts'
import AdminMedia from '@/components/AdminMedia'
import PlainTemplate from '@/components/PlainTemplate'

export default {
  name: 'eventDetails',
  props: [ 'eventId' ],
  components: {
    PlainTemplate, Loader, AdminSessions, AdminCharts, AdminMedia
  },
  data () {
    return {
      events: null,
      loading: false,
      selectedTab: 1
    }
  },
  methods: {
    selectTab: function (tab) {
      this.selectedTab = tab
    }
  },
  mounted () {
    this.loading = true
    api.getAdminEventDetails(this.eventId).then((result) => {
      this.loading = false
      // console.log(result)
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
#event
  padding: 10px 30px

.tab
  border 1px solid #ddd
  flex 1
  padding: 10px 0
  background: #f4f4f4
  &:hover
    background: #fafafa

  &.selected
    border none
    border-top: 1px solid #ddd
    background: transparent
</style>
