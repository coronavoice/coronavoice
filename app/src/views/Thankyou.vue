<template lang="pug">
  <PlainTemplate title="Details" back="true">
    <template v-slot:content>
      #thank-you
        h2 Thank you!
        #thanks-text(v-html="thanksText")
        thanks(:sessionId="sessionId")

    </template>
  </PlainTemplate>

</template>

<script>
import api from '@/api'
import Thanks from '@/components/Thanks'
import PlainTemplate from '@/components/PlainTemplate'

export default {
  name: 'Thankyou',
  props: [ 'sessionId' ],
  components: {
    Thanks, PlainTemplate
  },
  data () {
    return {
      thanksText: null
    }
  },
  mounted () {
    api.getSessionEvent(this.sessionId).then((result) => {
      this.thanksText = result[0].thanks_text
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

#answer-buttons {
  padding: 20px;

  .row {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;

    a {
      display: block;
      text-decoration: none;
      padding: 30px 20px 15px 20px;
      flex: 0.5;
      font-size: 5rem;
      margin: 5px;
      border-radius: 10px;
    }
  }
}

</style>
