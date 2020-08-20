<template lang="pug">
  <CloudTemplate title="Settings" back="true">
    <template v-slot:content>
      div
        #answer-buttons(v-if="loading")
          Loader(:loading="loading")
        #answer-buttons(v-show="!loading")
          #events-view
            h3 Settings
            div
              a.button(@click='join') Join
            div
              a#signout(@click="logout") {{ $store.state.currentUser.isAnonymous ? "Login using Email" : "Logout"}}
    </template>
  </CloudTemplate>
</template>

<script>
import firebase from 'firebase'
import api from '@/api'
import Loader from '@/components/Loader'
import CloudTemplate from '@/components/CloudTemplate'

export default {
  name: 'UserSettings',
  components: {
    CloudTemplate, Loader
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    logout: function () {
      firebase.auth().signOut().then(() => {
        // Sign-out successful.
        // console.log('loggedOut')
        this.$router.replace({ name: 'email-login' })
      }).catch(function (error) {
        // An error happened.
        console.log(error)
      })
    },
    goBack: function () {
      this.$router.go(-1)
    },
    join: function (code) {
      code = window.prompt('Please enter join code')
      // console.log(code)
      if (code) {
        this.loading = true
        api.getSessionId(code).then((result) => {
          this.loading = false
          if (!result || !result.id) {
            this.error = true
          } else {
            this.$router.push({ name: 'event', params: { sessionId: result.id } })
          }
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
#app{
  padding: 0 0 60px 0;
}
</style>
<style scoped lang="stylus">
@import '~stylus/shared'
  
#main {
  height: 100%;
  // background: white;
  background-repeat: no-repeat;
  background-position: top center;
  background-size: contain;
  // background-image:  url('~@/assets/clouds.svg');
}

#cloud-head
  position: relative;
  padding-top: 70px;
  background: #4192A1;
  img
    width: 100%;
    margin-bottom: -20px;

  #head-content
    position: absolute
    bottom: 15px;
    right: 0;
    color: $secondary;
    font-size: 2.2rem;
    left: 0;
    text-align: center;
    letter-spacing: 0.1rem;

#cloud-body
  background: white
  padding 0 20px;

#answer-buttons
  padding: 10px 20px;

#events-view
  padding: 10px 20px;

  .button
    display: block;
    margin: 10px auto;
    font-size: 1.2rem;
    padding: 15px 30px;
    // border-radius: 10px;
    background: $button-primary;
    color: $text-light;
    border: none;
    font-weight: 500

  #signout
    display: block;
    margin: 10px auto;
    font-size: 1.2rem;
    padding: 15px 30px;
    // border-radius: 10px;
    background: $button-lt-gray;
    color: $text-gray;
    font-weight: 500
    border: none;
</style>
