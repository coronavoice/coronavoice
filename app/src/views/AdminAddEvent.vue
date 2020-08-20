<template lang="pug">
  <PlainTemplate title="Survey Details" back="true">
    <template v-slot:content>
      #settings
        #event(v-if="loading")
            Loader(:loading="loading")
        #event-settings(v-show="!loading")
          .heading
            h3 Add Survey
            #edit-event
              #save( @click="saveEvent") Save
              #discard( @click="discardEdits") Discard
          #general-settings.section
            .row
              label Survey Name
              input.event-input(type="text" v-model="editedEvent.name" placeholder="Survey Name" name="name" )
            .row
              label Survey Status
              select.event-input(v-model="editedEvent.status" placeholder="Survey Status" name="status" )
                option(v-for="(item, i) in status" :value="i") {{ item }}
            .row(style="padding-bottom: 50px;")
              label Survey Description
              .quill( )
                quill-editor(v-model="editedEvent.description" ref="descriptionQuillEditor" v-bind:options="{ ...editorOptions, placeholder: 'Survey description' }" style="height: 200px;")
            #feedback-settings.section
              h4 Feedback
              .row
                label Main Question
                input.event-input(type="text" v-model="editedEvent.question" placeholder="Main Question" name="main-question" )
              .row
                label How often can a user give feedback?
                select.event-input(v-model="editedEvent.cooldownPeriod" placeholder="Cooldown" name="cooldown" )
                  option(v-for="(item, i) in cooldownVals" :value="i") {{ item }}
            #media-settings.section(style="padding-bottom: 50px;")
              h4 Follow Up Feedback
              .row
                label Follow Up Feedback
                input.event-input(type="checkbox" v-model="editedEvent.extraFields.video" placeholder="Follow-up" name="followup-video")
                label.label-for(for="followup-video") Video
                input.event-input(type="checkbox" v-model="editedEvent.extraFields.audio" placeholder="Follow-up" name="followup-audio")
                label.label-for(for="followup-audio") Audio
                input.event-input(type="checkbox" v-model="editedEvent.extraFields.text" placeholder="Follow-up" name="followup-text")
                label.label-for(for="followup-text") Text
              .row(v-show="editedEvent.extraFields.video || editedEvent.extraFields.audio || editedEvent.extraFields.text")
                label Follow Up Feedback Question
                .quill( )
                  quill-editor(v-model="editedEvent.followupLabel" ref="followUpQuillEditor" placeholder="Follow-up Question" name="description" :disabled="!(editedEvent.extraFields.video || editedEvent.extraFields.audio || editedEvent.extraFields.text)" v-bind:options="{ ...editorOptions, placeholder: 'Follow-up Question' }" style="height: 200px;")
            #thankyou-settings.section
              h4 Thank You Page
              .row
                label Display Results
                input.event-input(type="checkbox" v-model="editedEvent.showResults" placeholder="Show Results" name="show-results" )
                label.label-for(for="show-results" ) Enabled
              .row
                label Thank You Message
                .quill( )
                  quill-editor(v-model="editedEvent.thanksText" ref="myQuillEditor" v-bind:options="{ ...editorOptions, placeholder: 'Thank you message' }")

            #add-session.section
              h4 First Session
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

            #edit-event
              #save( @click="saveEvent") Save
              #discard( @click="discardEdits") Discard
    </template>
  </PlainTemplate>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import api from '@/api'
import Loader from '@/components/Loader'
import { quillEditor } from 'vue-quill-editor'
import PlainTemplate from '@/components/PlainTemplate'

export default {
  name: 'admin-add-event',
  components: {
    Loader, quillEditor, PlainTemplate
  },
  mounted () {
    this.event = {}
    this.initEvent()
    this.initSession()
    if (!this.event.followUpLabel || this.event.followUpLabel === '') this.event.followUpLabel = this.event.question
  },
  data () {
    return {
      editing: false,
      status: [ 'Finished', 'Ongoing', 'Under Analysis' ],
      cooldownVals: ['As many time as they want', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Only once'],
      editedEvent: {},
      event: {},
      loading: false,
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
    initSession () {
      this.editedSession = {
        sessionId: null,
        eventId: null,
        new: true,
        name: null,
        status: 1,
        privacy: false,
        metadata: { }
      }
    },
    initEvent () {
      this.editedEvent = {
        eventId: null,
        name: null,
        question: null,
        followUpEnabled: true,
        followUpLabel: null,
        extraFields: { video: true, audio: true, text: true },
        expiryDate: null,
        showFeedback: false,
        showResults: true,
        status: 1,
        cooldownPeriod: 2,
        description: null,
        thanksText: null
      }
    },
    async saveEvent () {
      this.editing = false
      this.loading = true
      if (this.editedEvent.extraFields.video || this.editedEvent.extraFields.audio || this.editedEvent.extraFields.text) {
        this.editedEvent.followupEnabled = true
      } else {
        this.editedEvent.followupEnabled = false
      }
      let createdEvent = {
        event: this.editedEvent,
        session: this.editedSession
      }
      let result = await api.createEvent(createdEvent)
      this.loading = false
      // console.log(result)
      if (result.insertId) this.$router.push({ name: 'admin-event-details', params: { eventId: result.insertId } })
    },
    discardEdits () {
      this.initEvent()
      this.initSession()

      this.$router.push({ name: 'admin-events' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import '~stylus/shared'

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
  padding 10px 30px

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

input[type=text].event-input
  padding 10px
  font-size 0.9rem
  min-width: 50%
  border 1px solid #ddd
  width: 100%
  box-sizing: border-box;

select.event-input
  padding 10px
  font-size 0.9rem
  min-width: 50%

#add-session
  text-align: left

</style>
