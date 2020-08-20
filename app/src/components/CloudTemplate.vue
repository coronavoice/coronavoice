<template lang="pug">
  #main
    #back-header
      a#back(@click="goBack" v-if="back")
        font-awesome-icon(icon="arrow-left")
      img(v-if="instanceLogo" :src="instanceLogo")
      span {{ instance }}
    Header(:noback="!back")
    #cloud-head
      img(src="~@/assets/clouds.svg")
      #head-content {{ title }}
    #cloud-body
      #content
        #content-header
          //- a#back(v-if="back" @click="goBack")
          //-   font-awesome-icon(icon="arrow-left")
          #logo {{ title }}
        #content-body
          slot(name='content')
    #info-footer
      img.idi(src="@/assets/iDi_logo_extended_black_green.svg")
      div
        div
          router-link#privacy(:to="{name: 'privacy'}") Privacy Policy
          span |
          router-link#privacy(:to="{name: 'terms'}") Terms of Use
        #currently-logged Currently logged in as
          span(v-if="$store.state.currentUser") {{ $store.state.currentUser.isAnonymous ? "Anonymous" :$store.state.currentUser.email }}

    #overlay(:class="{open: isOpenHelp}" @click="closeHelp")
    #need-help(:class="{open: isOpenHelp}" v-if="main")
      .label(@click="toggleHelp" :class="{open: isOpenHelp}")
        .text Need help?
      .content-container(v-show="!isFullyClosed")
        .close
          a(@click="closeHelp") X
        .content(v-show="!isFullyClosed")
          h3 {{ instance }}
          p(style="white-space: pre-wrap;") {{ instanceHelpDescription }}
          p.q Can’t see anything to click on?
          blockquote Press the 
            strong cog
            |  icon (
            font-awesome-icon(icon="cog")
            | ) to enter a join code or log in
          p.q What are the other buttons for?
          blockquote The 
            strong home
            |  icon (
            font-awesome-icon(icon="home")
            | ) brings you back here
          blockquote The 
            strong clock
            |  icon (
            font-awesome-icon(icon="history")
            | ) allows you to view your feedback history
          p.q What is a join code?
          blockquote A join code is a five letter code that allows access to a survey for a particular site. It may have been sent to you by email along with a direct link
          p.q Why would I log in?
          blockquote If you log in you can keep track what feedback you have left and come back leave more so we can see how things are changing over time
          p.q How do I log in?
          blockquote Just enter an email, you will be sent a verification email, clicking the link in there logs you in!

</template>

<script>
import Header from '@/components/Header'
import { mapGetters } from 'vuex'

export default {
  name: 'CloudTemplate',
  props: [ 'back', 'title' ],
  computed: {
    main () {
      return this.$route.name === 'home'
    },
    ...mapGetters(['instance', 'instanceLogo', 'instanceHelpDescription'])
  },
  methods: {
    goBack: function () {
      this.$router.go(-1)
    },
    closeHelp () {
      this.isOpenHelp = false
      this.transitionTimer = setTimeout(() => { this.isFullyClosed = true }, 500)
    },
    openHelp () {
      clearTimeout(this.transitionTimer)
      this.isFullyClosed = false
      this.isOpenHelp = true
    },
    toggleHelp () {
      if (this.isOpenHelp) {
        this.closeHelp()
      } else {
        this.openHelp()
      }
    }
  },
  data () {
    return {
      isOpenHelp: false,
      isFullyClosed: true,
      transitionTimer: null
    }
  },
  components: {
    Header
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
#app{
  padding: 0 0 54px 0;
  position relative;
}
#overlay
  background: rgba(200,200,200,0.7);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: none
  &.open
    display: block
#need-help
  position: absolute;
  top: 130px;
  width: 0;
  right: 0;
  background: #005EB8;
  box-sizing: border-box;
  color: white;
  border-radius: 10px 0 0 10px
  min-height: 250px;
  margin-bottom: 100px
  transition: 0.5s;
  &.open
    right: 0 !important;
    width: 80%;
  .label
    font-weight: 500;
    font-size: 0.9rem;
    position: fixed;
    right: 0;
    left: auto;
    width: 20px;
    padding: 20px 10px;
    top: 330px;
    background: #005EB8;
    border-radius: 10px 0 0 10px
    writing-mode: vertical-lr;
    cursor: pointer;
    white-space: nowrap;
    transition: 0.5s;
    &.open
      background: #333;
      position: fixed;
      right: 80%;
      // top: 200px;
      // right: auto
    .text
      transform: rotate(180deg);
  .content-container
    padding 20px;
    position: relative;
    .close
      position: absolute;
      top: 10px;
      right: 20px;
      font-weight: bold;
      a
        color: white
        cursor: pointer
    .content
      text-align: left
      // max-height: 400px;
      // overflow-y: auto
      p.q
        font-weight: bold;
        margin-bottom: 0;
        margin-top: 20px;
      blockquote
        margin-top: 5px
</style>

<style scoped lang="stylus">
@import '~stylus/shared'

@media screen and (min-device-aspect-ratio: 3072/4096)
  #cloud-head
    display none
  #header
    display flex !important
  #back-header
    display none !important
  #main
    padding-top: 68px
    background-image: url('~@/assets/cloudtop.svg')
    background-attachment fixed
    background-size contain
    background-position top center
    background-color $cloud
    height: 100%
    background-repeat: no-repeat

  #cloud-body
    background transparent !important
    padding: 0 70px 30px 70px !important

  #content
    max-width 95%
    margin 0 auto
    margin-top: 50px
    padding 30px
    background white
    padding-top: 50px
    position: relative
    box-shadow: 0 3px 6px rgba(0,0,0,0.16)
  #content-header
    position: absolute;
    background: $secondary;
    color: $text-light;
    left: 0;
    right: 0;
    top: 0;
    height: 48px;
    display: -ms-flexbox;
    display: flex;
    padding-left: 15px
    -ms-flex-direction: row;
    flex-direction: row;
    #back
      font-size: 1.2rem
      padding: 14px 10px 15px 0px;
    #fc
      flex: 1
    a
      color: $text-light
    #logo
      padding: 10px 5px;
      line-height: 30px;
      font-size: 1.2rem;
      letter-spacing: 0.1rem;
  #info-footer
    display: none !important

@media screen and (max-device-aspect-ratio: 3071/4096)
  #header
    display none !important
  #main
    height: 100%;
    background: $body-background;
    background-repeat: no-repeat;
    background-position: top center;
    background-size: contain;
    padding-bottom: 30px
    // background-image:  url('~@/assets/clouds.svg');
  #content-header
    display: none !important
  #info-footer
    display: block !important
  #cloud-body
    background: $body-background

#cloud-head
  position: relative;
  padding-top: 70px;
  background: $secondary;
  img
    width: 100%;
    margin-bottom: -20px;

  #head-content
    position: absolute
    bottom: 15px;
    right: 0;
    color: $secondary;
    font-size: 1.8rem;
    left: 0;
    text-align: center;
    letter-spacing: 0.1rem;

#cloud-body
  padding 0 20px;

#content-body
  padding: 15px 20px;

#back-header
  position: fixed;
  background: $secondary;
  color: $text-light;
  left: 0;
  right: 0;
  top: 0;
  height: 54px;
  padding-top: 4px
  padding-left: 10px
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: row;
  flex-direction: row;
  z-index: 101
  align-items center
  #back
    font-size: 1.2rem
    padding: 16px 10px 15px 10px;
  #fc
    flex: 1
  a
    color: $text-light
  #logo
    padding: 10px 5px;
    line-height: 32px;
    font-size: 1.2rem;
    letter-spacing: 0.1rem;
  img
      height: 30px;
      margin: 0 10px 0 5px;
  span
    font-size: 1.2rem;
    letter-spacing: 0.1rem;

#info-footer
  padding 30px 10px 10px 10px
  font-size 0.9em
  span
    margin 0 10px
  .idi
    height: 40px;
    display: block;
    margin: 15px auto;
  
  #currently-logged
    font-size: 0.75rem;
    margin-top: 10px;
    font-weight: 500
    font-style italic

    span
      font-weight: bold
      margin: 0 5px;
</style>
