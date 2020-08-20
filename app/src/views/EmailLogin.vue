<template lang="pug">
  <CloudTemplate :title="signupView? 'Sign Up' : 'Login'">
    <template v-slot:content>
      div
        #login-section(v-show='loading')
          Loader(:loading='loading')
        #login-section(v-show='!loading && !emailRequested && !signupView')
          .row
            #title Sign in
          .row
            #subtitle to continue
          .row
            input(type='text' v-model='email' placeholder="Email")
          .row
            button#login-button(href='#' style="font-size: 12pt" @click="login()") Sign in
        #login-section(v-show='!loading && !emailRequested && signupView')
          .row
            #title Sign up
          .row
            #subtitle to continue
          .row
            input(type='text' v-model='name' placeholder="Name")
          .row
            input(type='text' v-model='email' placeholder="Email")
          .row
            button(style="font-size: 12pt" @click="signup()") Sign Up
        #login-section(v-show='!loading && emailRequested')
          .row
            #subtitle Check your email for login link
    </template>
  </CloudTemplate>
</template>

<script>
import firebase from 'firebase'
import api from '@/api'
import Loader from '@/components/Loader'
import CloudTemplate from '@/components/CloudTemplate'

export default {
  name: 'EmailLogin',
  props: ['to'],
  components: { Loader, CloudTemplate },
  methods: {
    login: function () {
      var actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be whitelisted in the Firebase Console.
        url: this.$store.getters.instanceBaseUrl,
        // This must be true.
        handleCodeInApp: true,
        iOS: {
          bundleId: this.$store.getters.instancePackageName
        },
        android: {
          packageName: this.$store.getters.instancePackageName,
          installApp: false,
          minimumVersion: '12'
        },
        dynamicLinkDomain: this.$store.getters.instanceDynamicLink
      }
      let email = this.email
      api.checkUser(this.email).then((result) => {
        // console.log(result)
        if (!result) {
          this.error = true
        } else {
          if (result.exists) {
            firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
              .then(() => {
                // The link was successfully sent. Inform the user.
                // Save the email locally so you don't need to ask the user for it again
                // if they open the link on the same device.
                window.localStorage.setItem('emailForSignIn', email)
                this.emailRequested = true
              })
              .catch(function (error) {
                // Some error occurred, you can inspect the code: error.code
                console.log(error)
              })
          } else {
            // console.log('new user')
            this.signupView = true
          }
        }
      })
    },
    signup: function () {
      var actionCodeSettings = {
        // url: 'https://thoughtcloud.org.uk',
        url: this.$store.getters.instanceBaseUrl,
        // This must be true.
        handleCodeInApp: true,
        iOS: {
          bundleId: this.$store.getters.instancePackageName
        },
        android: {
          packageName: this.$store.getters.instancePackageName,
          installApp: false,
          minimumVersion: '12'
        },
        dynamicLinkDomain: this.$store.getters.instanceDynamicLink
      }
      let email = this.email
      api.signup({ email: this.email, name: this.name }).then((result) => {
        // console.log(result)
        if (!result) {
          this.error = true
        } else {
          firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
            .then(() => {
              window.localStorage.setItem('emailForSignIn', email)
              this.emailRequested = true
            })
            .catch(function (error) {
              console.log(error)
            })
        }
      })
    }
  },
  data () {
    return {
      question: "How was today's session?",
      questionId: 1,
      email: '',
      name: '',
      signupView: false,
      emailRequested: false,
      loading: true,
      timer: null
    }
  },
  computed: {
    loginStatus () {
      return this.$store.state.currentUser
    }
  },
  watch: {
    loginStatus (val, oldVal) {
      if (val && !this.timer) {
        let to = (this.to && this.to.name !== 'login') ? { name: this.to.name, params: { ...this.to.params } } : { name: 'home' }
        this.timer = setTimeout(() => {
          this.timer = null
          // console.log('this.to:')
          // console.log(this.to)
          this.$router.replace(to)
        }, 3000)
      }
    }
  },
  mounted () {
    // console.log('props: ' + this.$store.state.currentUser)
    console.log(this.to)
    let to = (this.to && this.to.name !== 'login') ? { name: this.to.name, params: { ...this.to.params } } : { name: 'home' }
    if (this.$store.state.currentUser) {
      this.$router.replace(to)
    }
    // firebase.auth().signInAnonymously().catch((error) => {
    //   // Handle Errors here.
    //   if (error) {
    //     this.error = true
    //     console.log(error.message)
    //     console.log(error)
    //   }
    // })
    setTimeout(() => { this.loading = false }, 5000)
    document.addEventListener('deviceready', async () => {
      this.ready = true
      console.log('ready')
      this.email = window.localStorage.getItem('emailForSignIn')
    }, false)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import '~stylus/shared'

#login-section
  padding: 20px;
  padding-top: 30px;

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
      font-size: 1.2rem;
      font-weight: lighter;
      text-transform: lowercase;
      letter-spacing: 0.1rem;
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
      // border-radius: 10px;
      border: none;
      padding: 10px 30px;
      background-color: $text-light;
      background: $secondary ;
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
      // border-radius: 10px;

</style>
