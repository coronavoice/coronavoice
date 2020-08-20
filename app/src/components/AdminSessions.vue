<template lang="pug">
  #settings
    #event(v-if="loading")
        Loader(:loading="loading")
    #event-settings(v-show="!loading && !editingSession" v-if="events")
      .heading
        h3 {{ events[0].event_name }}
        #edit-event(v-if="!editing")
          #edit( @click="editEvent") Edit Survey
        #edit-event(v-if="editing")
          #save( @click="saveEvent") Save
          #discard( @click="discardEdits") Discard
      #date-created Date created: {{ events[0].event_date_created | moment('M/D/YYYY, hh:mma') }}
      #general-settings.section
        .row
          label Survey Name
          .event-data(v-if="!editing") {{ events[0].event_name }}
            span.no-data(v-if="!events[0].event_name" v-show="!editing") Empty
          input.event-input(type="text" v-model="editedEvent.name" placeholder="Survey Name" name="name" v-if="editing")
        .row
          label Sruvey Status
          .event-data(v-if="!editing") {{ status[events[0].event_status] }}
          select.event-input(v-model="editedEvent.status" placeholder="Survey Status" name="status" v-if="editing")
            option(v-for="(item, i) in status" :value="i") {{ item }}
        .row
          label Survey Description
          .event-data.quill-data(v-html="events[0].description" v-if="!editing" style="text-align: center;")
          span.event-data.no-data(v-if="!events[0].description" v-show="!editing") Empty
          .quill(v-if="editing" )
            quill-editor(v-model="editedEvent.description" ref="descriptionQuillEditor" v-bind:options="{ ...editorOptions, placeholder: 'Survey description' }" style="height: 200px;")
        #feedback-settings.section(style="margin-top: 50px;")
          h4 Feedback
          .row
            label Main Question
            .event-data(v-if="!editing") {{ events[0].question }}
              span.no-data(v-if="!events[0].question" v-show="!editing") Empty
            input.event-input(type="text" v-model="editedEvent.question" placeholder="Main Question" name="main-question" v-if="editing")
          .row
            label How often can a user give feedback?
            .event-data(v-if="!editing") {{ cooldownVals[events[0].cooldown] }}
            select.event-input(v-model="editedEvent.cooldownPeriod" placeholder="Cooldown" name="cooldown" v-if="editing")
              option(v-for="(item, i) in cooldownVals" :value="i") {{ item }}
        #media-settings.section(style="padding-bottom: 50px;")
          h4 Follow Up Feedback
          .row
            label Follow Up Feedback
            .event-data(v-if="!editing && !events[0].followup_enabled") Disabled
            .event-data(v-if="!editing && events[0].followup_enabled && JSON.parse(events[0].extra_fields || '{}').video") Video
            .event-data(v-if="!editing && events[0].followup_enabled && JSON.parse(events[0].extra_fields || '{}').audio") Audio
            .event-data(v-if="!editing && events[0].followup_enabled && JSON.parse(events[0].extra_fields || '{}').text") Text
            //- input.event-input(type="checkbox" v-model="editedEvent.followupEnabled" placeholder="Follow-up" name="followup-enabled" v-if="editing")
            input.event-input(type="checkbox" v-model="editedEvent.extraFields.video" placeholder="Follow-up" name="followup-video" v-if="editing")
            label.label-for(for="followup-video" v-if="editing") Video
            input.event-input(type="checkbox" v-model="editedEvent.extraFields.audio" placeholder="Follow-up" name="followup-audio" v-if="editing")
            label.label-for(for="followup-audio" v-if="editing") Audio
            input.event-input(type="checkbox" v-model="editedEvent.extraFields.text" placeholder="Follow-up" name="followup-text" v-if="editing")
            label.label-for(for="followup-text" v-if="editing") Text
          .row
            label.quill-data(v-show="events[0].followup_enabled || editing") Follow Up Question
            //- .event-data(v-if="!editing" v-show="events[0].followup_enabled") {{ events[0].followup_label }}
            .event-data(v-html="events[0].followup_label" v-if="!editing" v-show="events[0].followup_enabled")
              span.no-data(v-if="!events[0].followup_label" v-show="!editing") Empty
            //- input.event-input(type="text" v-model="editedEvent.followupLabel" placeholder="Follow-up Question" name="description" v-if="editing" :disabled="!editedEvent.followupEnabled")
            .quill( )
              quill-editor(v-if="editing" v-model="editedEvent.followupLabel" ref="followUpQuillEditor" placeholder="Follow-up Question" name="description" :disabled="!(editedEvent.extraFields.video || editedEvent.extraFields.audio || editedEvent.extraFields.text)" v-bind:options="{ ...editorOptions, placeholder: 'Follow-up Question' }" style="height: 200px;")

        #thankyou-settings.section
          h4 Thank You Page
          .row
            label Display Results
            .event-data(v-if="!editing") {{ events[0].show_results ? 'Enabled' : 'Disabled' }}
            input.event-input(type="checkbox" v-model="editedEvent.showResults" placeholder="Show Results" name="show-results" v-if="editing")
            label.label-for(for="show-results" v-if="editing") Enabled
          .row
            label Thank You Message
            .event-data(v-html="events[0].thanks_text" v-if="!editing")
            span.event-data.no-data(v-if="!events[0].thanks_text" v-show="!editing") Empty
            .quill(v-if="editing" )
              quill-editor(v-model="editedEvent.thanksText" ref="myQuillEditor" v-bind:options="{ ...editorOptions, placeholder: 'Thank you message' }")
        #edit-event(v-if="!editing")
          #edit( @click="editEvent") Edit Survey
        #edit-event(v-if="editing")
          #save( @click="saveEvent") Save
          #discard( @click="discardEdits") Discard

    #session(v-if="!editing")
      .heading
        h3 Sessions
        #edit-event(v-if="!editingSession")
          #edit( @click="addSession") Add a New Session
        #edit-event(v-if="editingSession")
            #save( @click="saveSession") Save
            #discard( @click="discardSessionEdits") Discard

      #add-session(v-if="editingSession")
        .row
          label Session Name
          input.event-input(type="text" v-model="editedSession.name" placeholder="Session Name" name="name")
        .row
          label Session Status
          select.event-input(v-model="editedSession.status" placeholder="Session Status" name="status")
            option(v-for="(item, i) in status" :value="i") {{ item }}
        .row
          label Session Privacy
          input.event-input(type="checkbox" v-model="editedSession.privacy" placeholder="Session Privacy" name="privacy")
          label.label-for(for="show-results") Make Public
        .row
          label Location
            span.optional (optional)
          input.event-input(type="text" v-model="editedSession.metadata.location" placeholder="Location" name="location")

      .event(v-for="(event, i) in events" v-show="!loading && !editingSession" v-if="events")
        .event-data
          .ev-name
            div {{ event.session_name }}
            a.session-edit(@click="editSession(i)")
              font-awesome-icon(icon="edit")
          .ev-status
            span(style="font-weight: bold") Joincode:
            span   {{ event.join_code }}
          .ev-status(v-if="event.session_fb_link")
            span(style="font-weight: bold") Share Link:
            span
              a(:href="event.session_fb_link" target="_blank") {{ event.session_fb_link }}
          .ev-status
            span(style="font-weight: bold") Status:
            span   {{ ['finished', 'ongoing', 'under analysis'][event.session_status] }}
          .ev-status
            span
              router-link(:to="{ name: 'public-data', params: { sessionId: event.session_id } }") Show Results
          .ev-date {{ event.session_date_created | moment('M/D/YYYY, hh:mma' ) }}
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.bubble.css'
import api from '@/api'
import Loader from '@/components/Loader'
import { quillEditor } from 'vue-quill-editor'

export default {
  name: 'admin-sessions',
  props: ['value'],
  components: {
    Loader, quillEditor
  },
  mounted () {
    this.events = this.value
    // console.log(this.events[0])
    if (!this.events[0].followup_label || this.events[0].followup_label === '') this.events[0].followup_label = this.events[0].question
  },
  data () {
    return {
      editing: false,
      status: [ 'Finished', 'Ongoing', 'Under Analysis' ],
      cooldownVals: ['As many time as they want', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Only once'],
      editedEvent: {},
      events: [],
      loading: false,
      editingSession: false,
      editedSession: {
        sessionId: null,
        new: true,
        name: null,
        status: 1,
        privacy: false,
        metadata: { }
      },
      editorOptions: {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'size': ['small', false, 'large'] }],
            ['bold', 'italic'],
            ['link'],
            ['clean'],
            ['image'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }]
          ]
        }
      }
    }
  },
  methods: {
    addSession () {
      this.editingSession = true
      this.initSession()
    },
    initSession () {
      this.editedSession = {
        sessionId: null,
        eventId: this.events[0].event_id,
        new: true,
        name: null,
        status: 1,
        privacy: false,
        metadata: { }
      }
    },
    editSession (index) {
      let session = this.events[index]
      let metadata = session.session_metadata ? JSON.parse(session.session_metadata) : {}
      this.editingSession = true
      this.editedSession = {
        sessionId: session.session_id,
        eventId: session.event_id,
        new: false,
        name: session.session_name,
        status: session.session_status,
        privacy: session.privacy,
        metadata
      }
    },
    async saveSession () {
      this.editingSession = false
      this.loading = true
      // console.log(this.editedSession)
      if (this.editedSession.new) {
        await api.createSession(this.editedSession)
      } else {
        await api.updateSession(this.editedSession)
      }
      api.getAdminEventDetails(this.editedSession.eventId).then((result) => {
        this.loading = false
        if (!result || result.length === 0) {
          this.error = true
        } else {
          this.events = result
          this.$emit('input', this.events)
        }
      })
    },
    discardSessionEdits () {
      this.editingSession = false
      this.initSession()
    },
    initEvent () {
      this.editedEvent = {
        eventId: this.events[0].event_id,
        name: this.events[0].event_name,
        question: this.events[0].question,
        followupEnabled: this.events[0].followup_enabled,
        followupLabel: this.events[0].followup_label,
        extraFields: this.events[0].extra_fields ? JSON.parse(this.events[0].extra_fields) : {},
        expiryDate: null,
        showFeedback: false,
        showResults: this.events[0].show_results,
        status: this.events[0].event_status,
        cooldownPeriod: this.events[0].cooldown,
        description: this.events[0].description,
        thanksText: this.events[0].thanks_text
      }
    },
    editEvent () {
      this.initEvent()

      if (this.editedEvent.followupEnabled) {
        if (!this.events[0].extra_fields || this.events[0].extra_fields === '{}') {
          this.editedEvent.extraFields.video = true
          this.editedEvent.extraFields.audio = true
          this.editedEvent.extraFields.text = true
        }
      } else {
        this.editedEvent.extraFields.video = false
        this.editedEvent.extraFields.audio = false
        this.editedEvent.extraFields.text = false
      }

      this.editing = true
    },
    async saveEvent () {
      this.editing = false
      this.loading = true
      if (this.editedEvent.extraFields.video || this.editedEvent.extraFields.audio || this.editedEvent.extraFields.text) {
        this.editedEvent.followupEnabled = true
      } else {
        this.editedEvent.followupEnabled = false
      }
      this.editedEvent.extraFields = JSON.stringify(this.editedEvent.extraFields)
      // eslint-disable-next-line no-unused-vars
      let result = await api.updateEvent(this.editedEvent)
      // console.log(result)
      api.getAdminEventDetails(this.editedEvent.eventId).then((result) => {
        this.loading = false
        if (!result || result.length === 0) {
          this.error = true
        } else {
          this.events = result
          this.$emit('input', this.events)
        }
      })
    },
    discardEdits () {
      this.editing = false
      this.initEvent()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import '~stylus/shared'

#date-created
    font-size: 0.85rem;
    color: $text-lt-gray;
    margin-bottom 5px;
.ev-name
  display: flex
  flex-direction: row
  justify-content space-between
  align-items center
  width 100%

.session-edit
  color: $secondary
  margin-left: 10px
  text-decoration: none
  cursor: pointer
  width: auto !important

.heading
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  h3, h4
    flex: 1
    text-align: left
.optional
  font-size: 0.8 em
  color: $text-gray
  margin 0 5px
#edit-event
  margin 0 auto
  display: flex
  flex-direction row
  justify-content center
#edit
  // border-radius 10px
  padding 10px 15px
  background $secondary
  color $text-light
  font-weight: bold
  cursor pointer
  margin: 2px

#discard
  // border-radius 10px
  padding 10px 15px
  background $button-gray
  color $text-light
  font-weight: bold
  cursor pointer
  margin: 2px

#save
  // border-radius 10px
  padding 10px 15px
  background $button-primary
  color $text-light
  font-weight: bold
  cursor pointer
  display: inline-block
  margin: 2px

#event-settings
  text-align: left

  .section
    padding 10px
    border 1px solid $border-light
    margin-bottom: 10px
  h4
    text-align center
    margin-bottom 0px
.row
  padding 10px 0
label
  color $secondary
  font-size 0.9rem
  font-weight: bold
  display: block
.label-for
  display: inline-block !important
.event-data
  padding 5px 10px
  font-size: 1rem
  display: block
  width 100%

.no-data
  font-weight: bold
  font-style italic
  font-size 0.9rem
  color $button-gray

input[type=text].event-input
  padding 10px
  font-size 0.9rem
  min-width: 50%
  border 1px solid $button-gray
  width: 100%
  box-sizing: border-box;

select.event-input
  padding 10px
  font-size 0.9rem
  min-width: 50%

#add-session
  text-align: left

#session
  // background: #fafafa;
  border: 1px solid #eee;
  padding: 10px;
  // border-radius: 10px;
  margin-bottom 10px
  margin-top 10px

.event
  display: flex
  flex-direction row
  justify-content space-between
  align-items center
  padding 10px 10px
  margin-bottom: 10px
  background: #fafafa;
  border: 1px solid $border-light;
  // border-radius: 10px;
  &:active
    background: $button-gray
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
  a
    width: 100%
    padding 5px
    text-align center

.quill-data >>> img
  max-width: 100%
</style>
