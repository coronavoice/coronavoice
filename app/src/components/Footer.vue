<template lang="pug">
  #footer(v-if="$store.state.currentUser")
    #fc
      router-link(to="/home")
        font-awesome-icon(icon="home")
    #fc
      router-link(to="/history")
        font-awesome-icon(icon="history")
    #fc
      router-link(to="/settings")
        font-awesome-icon(icon="cog")
    #fc(v-if="userRole == 'admin'")
      router-link(to="/admin/")
        font-awesome-icon(icon="users-cog")
    .info-footer
      img.idi(src="@/assets/iDi_logo_extended_white.svg")
      div
        div
          router-link#privacy(:to="{name: 'privacy'}") Privacy Policy
          span |
          router-link#privacy(:to="{name: 'terms'}") Terms of Use
        #currently-logged Currently logged in as
          span(v-if="$store.state.currentUser") {{ $store.state.currentUser.isAnonymous ? "Anonymous" :$store.state.currentUser.email }}

</template>

<script>
import api from '@/api'

export default {
  name: 'Footer',
  data () {
    return {

}
  },
  computed: {
    userRole () {
      // console.log('user role: ' + this.storeState.userRole)
      return this.$store.state.userRole
    }
  },
  watch: {
    userRole (val, oldVal) {
      // console.log('user role: ' + val)

      if (val) {
        this.user = val
      }
    }
  },
  methods: {
    join: function (code) {
      code = window.prompt('Please enter join code')
      // console.log(code)
      if (code) {
        api.getSessionId(code).then((result) => {
          if (!result || !result.id) {
            this.error = true
            this.$router.replace({ name: 'home' })
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
<style scoped lang="stylus">
@import '~stylus/shared'

@media screen and (min-device-aspect-ratio: 3072/4096)
  #fc
    display none !important
  .info-footer
    display flex !important
//   #footer
//     display none !important

#footer
  position: fixed
  background: $primary
  border-top: 6px solid $accent
  color: $text-light
  left: 0
  right: 0
  bottom: 0
  height: 50px
  display: flex
  padding-top: 10px
  flex-direction: row;
  justify-content: center;

  #fc
    flex: 1
    display block
  a
    color: $text-light
    font-size: 1.6rem

  .info-footer
    font-size 0.9rem
    margin 5px 0 10px 0;
    display none
    flex-direction row
    justify-content center
    align-items center
    span
      margin 0 10px
    a
      font-size 0.9rem
      font-weight 500
    a:hover
      color $text-gray
    .idi
      height: 40px;
      margin-right: 50px
      position: absolute
      // margin-top:20px
      top: 10px;
      left: 25px

  #currently-logged
    font-size: 0.75rem;
    margin-top: 5px;
    font-weight: 500
    font-style italic

    span
      font-weight: bold
      margin: 0 5px;

</style>
