<template lang="pug">
  #main
    Header
    #cloud-body
      #content
        #content-header
          //- a#back(v-if="back" @click="goBack")
          //-   font-awesome-icon(icon="arrow-left")
          #logo {{ title }}
        #tabs
          slot(name='tabs')
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
</template>

<script>
import Header from '@/components/Header'

export default {
  name: 'CloudTemplate',
  props: [ 'back', 'title' ],
  methods: {
    goBack: function () {
      this.$router.go(-1)
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
}
</style>
<style scoped lang="stylus">
@import '~stylus/shared'

@media screen and (min-device-aspect-ratio: 3072/4096)
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
    background white
    padding-top: 47px
    position: relative
    box-shadow: 0 3px 6px rgba(0,0,0,0.16)
  #content-header
    position: absolute;
    background: $secondary;
    // border-bottom: 4px solid #cae9f7;
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

@media screen and (max-device-aspect-ratio: 3071/4096)
  #main
    height: 100%;
    padding-top: 68px
    padding-bottom: 30px
    background: white;
    background-repeat: no-repeat;
    background-position: top center;
    background-size: contain;
    // background-image:  url('~@/assets/clouds.svg');
  #content-header
    display: none !important
  #info-footer
    display: block !important

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

a {
  color: $primary;
}

video, audio {
  max-width: 100%
}

#back-header
  position: fixed;
  background: $secondary;
  color: $text-light;
  left: 0;
  right: 0;
  top: 0;
  height: 54px;
  padding-top: 4px
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: row;
  flex-direction: row;
  z-index: 101
  #back
    font-size: 1.2rem
    padding: 16px 10px 15px 20px;
  #fc
    flex: 1
  a
    color: $text-light
  #logo
    padding: 10px 5px;
    line-height: 32px;
    font-size: 1.2rem;
    letter-spacing: 0.1rem;
#tabs
  display flex
  flex-direction row
  flex-wrap: nowrap
  justify-content space-around

#info-footer
  padding 30px 10px 10px 10px
  font-size 0.9em
  display: none;
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
