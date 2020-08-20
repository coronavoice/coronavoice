<template lang="pug">
  #app(:class="{main: main}")
    transition(name='fade' mode="out-in")
      router-view(style="margin: 0 auto" v-if="initCheck")
    Footer(v-if="loggedIn")
</template>

<script>
import firebase from 'firebase'
import store from '@/store'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default {
  name: 'App',
  components: { Header, Footer },
  store,
  data () {
    return {
      btTimer: null,
      loggedIn: false,
      initCheck: false
    }
  },
  computed: {
    main () {
      return this.$router.currentRoute.name === 'home'
    }
  },
  methods: {
    startBluetoothScan () {
      // console.log('starting scan...')
      window.evothings.eddystone.startScan(
        (beacon) => {
          // console.log(new Date() + ' - Found beacon: ' + beacon.url)
          window.evothings.eddystone.stopScan()
          if (this.btTimer) clearTimeout(this.btTimer)
          this.btTimer = setTimeout(this.startBluetoothScan, 20000)
        },
        (error) => {
          console.log('Eddystone scan error: ' + error)
        })
    }
  },
  created () {
    document.title = store.getters.instance
  },
  mounted () {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // console.log('already logged in')
        this.loggedIn = true
        store.dispatch('updateUser', user)
        // console.log('user')
        // console.log(user)
      } else {
        // console.log('not logged in')
        this.loggedIn = false
        store.dispatch('updateUser', null)
      }
      this.initCheck = true
    })
    // console.log('firebase check')
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
      var email = window.localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('Please provide your email for confirmation')
      }
      // The client SDK will parse the code from the link for you.
      firebase.auth().signInWithEmailLink(email, window.location.href)
        .then((result) => {
          // console.log('result signin')
          // console.log(result)
          window.localStorage.removeItem('emailForSignIn')
          window.location.href = store.getters.instanceBaseUrl
          if (result.user) {
            store.dispatch('updateUser', result.user)
          }
          // You can access the new user via result.user
          // Additional user info profile not available via:
          // result.additionalUserInfo.profile == null
          // You can check if the user is new or existing:
          // result.additionalUserInfo.isNewUser
        })
        .catch(function (error) {
          console.log(error)
        })
    }

    document.addEventListener('deviceready', async () => {
      // console.log('app ready')
      /* window.cordova.plugins.firebase.dynamiclinks.onDynamicLink((data) => {
        console.log('Dynamic link click with data:', data)
        console.log(data.deeplink)
        if (firebase.auth().isSignInWithEmailLink(data.deepLink)) {
          console.log('login email found')
          // Additional state parameters can also be passed via URL.
          // This can be used to continue the user's intended action before triggering
          // the sign-in operation.
          // Get the email if available. This should be available if the user completes
          // the flow on the same device where they started it.
          var email = window.localStorage.getItem('emailForSignIn')
          if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation')
          }
          // The client SDK will parse the code from the link for you.
          firebase.auth().signInWithEmailLink(email, data.deepLink)
            .then(function (result) {
              // Clear email from storage.
              console.log('logged in')
              console.log(result.user)
            // You can access the new user via result.user
            // Additional user info profile not available via:
            // result.additionalUserInfo.profile == null
            // You can check if the user is new or existing:
            // result.additionalUserInfo.isNewUser
            })
            .catch(function (error) {
              console.log(error)
              // Some error occurred, you can inspect the code: error.code
              // Common errors could be invalid email and invalid or expired OTPs.
            })
        } else if (/^https:\/\/openlab.ncl.ac.uk\/dokku\/tcv2-api\/session\/(\w+)\/?$/g.test(data.deepLink)) {
          let sessionId = /^https:\/\/openlab.ncl.ac.uk\/dokku\/tcv2-api\/session\/(\w+)\/?$/g.exec(data.deepLink)[1]
          if (sessionId != null) {
            this.$router.push({ name: 'event', params: { sessionId: sessionId } })
          }
        }
      }) */
    })
  }
}
</script>

<style lang="stylus">
@import '~stylus/shared'

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-dark;
  padding-bottom: 60px;
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.1s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

h4 {
  margin-top: 0
}

#main {
  // padding-top: 68px;
}

a {
  color: $link-normal;
}
a:hover {
  color: $link-hover;
}

video, audio {
  max-width: 100%
}

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
</style>
