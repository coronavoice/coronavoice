<template lang="pug">
  #header
    div#logo-container
      a#back(@click="goBack" v-if="!noback")
        font-awesome-icon(icon="arrow-left")
      #logo
        img(v-if="instanceLogo" :src="instanceLogo")
        span {{ instance }}
      #link-logo
        img(v-if="instanceLogo" :src="instanceLogo")
        router-link(to="/home") {{ instance }}

    #nav-links(v-if="!nolinks")
      #fc
        router-link(to="/history")
          font-awesome-icon(icon="history")
      #fc
        router-link(to="/settings")
          font-awesome-icon(icon="cog")
      #fc(v-if="userRole == 'admin'")
        router-link(to="/admin/")
          font-awesome-icon(icon="users-cog")
</template>

<script>
import api from '@/api'
import { mapGetters } from 'vuex'

export default {
  name: 'Header',
  data () {
    return {
      role: null,
    }
  },
  props: ['noback', 'nolinks'],
  computed: {
    userRole () {
      // console.log('user role: ' + this.storeState.userRole)
      return this.$store.state.userRole
    },
    ...mapGetters(['instance', 'instanceLogo'])
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
    goBack: function () {
      this.$router.go(-1)
    },
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
  #header
    #link-logo
      display flex !important

    #logo
      display none !important

    #nav-links
      display flex !important

#header
  position: fixed;
  background: $secondary;
  // border-bottom: 5px solid #9dc3cb;
  color: $text-light;
  left: 0;
  right: 0;
  top: 0;
  height: 64px;
  padding-top: 4px
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: row;
  flex-direction: row;
  z-index: 200
  padding-left: 18px
  justify-content space-between
  align-items center

  #logo-container
    display flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  #back
    font-size: 1.2rem
    padding: 16px 10px 15px 2px;

  a
    color: $text-light
  #logo
    padding: 10px 5px;
    line-height: 32px;
    font-size: 1.2rem;
    letter-spacing: 0.1rem;
    display flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img
      height: 30px;
      margin-right: 10px;
  #link-logo
    padding: 10px 5px;
    line-height: 32px;
    font-size: 1.2rem;
    letter-spacing: 0.1rem;
    display none
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img
      height: 30px;
      margin-right: 10px;
    a
      color: $text-light
      text-decoration : none
  #nav-links
    display none
    flex-direction row
    padding-right: 30px
    #fc
      flex: 1
      padding 5px
      margin 0 10px
</style>
