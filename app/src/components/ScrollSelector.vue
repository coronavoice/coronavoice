<template lang="pug">
  #scroll-selector
    // #scroll-selector-rotator(@mousedown="startDrag" @mousemove="doDrag" :style="{ left: `${left + x}px` }" v-hammer:panstart="startDrag" v-hammer:pan.horizontal="doDrag")
    #scroll-selector-rotator( :style="{ left: `${left + x}px` }" v-hammer:panstart="startDrag" v-hammer:pan.horizontal="doDrag" v-hammer:panend="stopDrag" )
      button(v-for="(option, i) in options" v-bind:key="`option-${i}`" :id="`option-${i}`" v-on:keyup.enter="selectItem(i+1)" v-on:keyup.space="selectItem(i+1)" v-hammer:tap="() => selectItem(i+1)" v-hammer:press="() => selectItem(i+1)" :style="{ width: halfItemWidth * 2 - 2 * itemMargin + 'px', 'margin-left': itemMargin + 'px', 'margin-right': itemMargin + 'px'}")
        svg(viewBox="0 0 60 45" style="width: 100%;")
          text(x="0" y="0" font-size="0.9em")
            tspan(v-for="(line, l) in option.toString().split(' ')" x="50%" dominant-baseline="middle" text-anchor="middle" :dy="`${((l + 1) * (100 / option.toString().split(' ').length))/2}%`" :style="{fill: (selectedOption == i + 1) ? '#28926a' : '#2c3e50'}") {{line}}
    #scroll-overlay
      #start-overlay
      #middle-overlay(:style="{width: halfItemWidth * 2 * 1.1 + 'px'}")
      #end-overlay
    #instructions ⟵ Swipe to change your selection ⟶

</template>

<script>

export default {
  name: 'ScrollSelector',
  props: ['options', 'onselect'],
  data () {
    return {
      halfItemWidth: 60,
      itemMargin: 10,
      selectedOption: null,
      dragging: false,
      x: 0,
      startX: 0,
      left: 250 - this.halfItemWidth / 2,
      bounds: { min: 0, max: 1000, rtWidth: 800, slWidth: 500 }
    }
  },
  mounted () {
    // window.addEventListener('mouseup', this.stopDrag)
    this.selectItem(Math.round(this.options.length / 2))
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('mouseup', this.stopDrag)
  },
  methods: {
    handleResize () {
      this.selectItem(this.selectedOption)
    },
    calculateBounds () {
      let selectorBounds = document.getElementById('scroll-selector').getBoundingClientRect()
      let rotatorBounds = document.getElementById('scroll-selector-rotator').getBoundingClientRect()
      this.bounds.max = selectorBounds.width / 2 - this.halfItemWidth
      this.bounds.min = -(rotatorBounds.width - (selectorBounds.width / 2) - this.halfItemWidth)
      this.bounds.rtWidth = rotatorBounds.width
      this.bounds.slWidth = selectorBounds.width
    },
    selectItem (option) {
      // console.log(option)
      this.calculateBounds()
      this.selectedOption = option
      this.onselect(this.selectedOption)
      this.left = ((this.options.length - option) * 2 * this.halfItemWidth + this.halfItemWidth) - (this.bounds.rtWidth - this.bounds.slWidth / 2)
    },
    startDrag (event) {
      this.dragging = true
      this.startX = event.center.x
      this.calculateBounds()
      // console.log('start drag')
    },
    doDrag (event) {
      if (this.dragging) {
        let x = event.deltaX
        this.x = Math.max(this.bounds.min - this.left, Math.min(this.bounds.max - this.left, x))
        if (isNaN(this.x)) {
          // console.log('broke;')
        }
      }
    },
    stopDrag (event) {
      if (!this.dragging) return
      // console.log('stop drag')
      this.dragging = false
      this.left += this.x
      let modifiedLeft = this.left + (this.bounds.rtWidth - this.bounds.slWidth / 2)
      let selectedItem = Math.floor(modifiedLeft / (2 * this.halfItemWidth))
      // if (Math.abs(this.x) < 40) {
      //   // modifiedLeft = this.bounds.rtWidth - (this.startX - document.getElementById('scroll-selector-rotator').getBoundingClientRect().x)
      //   selectedItem = (this.startX - document.getElementById('scroll-selector-rotator').getBoundingClientRect().x > this.bounds.slWidth / 2 - this.left + 40) ? selectedItem - 1 : ((this.startX - document.getElementById('scroll-selector-rotator').getBoundingClientRect().x < this.bounds.slWidth / 2 - this.left - 40) ? selectedItem + 1 : selectedItem)
      // }
      this.x = 0
      this.selectItem(this.options.length - selectedItem)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import '~stylus/shared'

  #scroll-selector
    margin 0 auto
    position relative
    width: 100%
    max-width: 500px
    display block
    height 7rem
    overflow-x hidden
    #scroll-selector-rotator
      position absolute
      display flex
      flex-direction row
      top 0
      bottom 0
      left 0
      padding 5px 0 1.2em 0
      button
        margin 0 10px
        font-size 1rem
        background transparent
        border 0px solid #ccc
        color: $secondary;
        outline-color $border-light ;
    #instructions
      position absolute
      bottom 0
      margin auto
      left 0
      right 0
      text-align center
      font-size: 0.8em
      color: #666
      pointer-events none
    #scroll-overlay
      position absolute
      left 0
      right 0
      top 0
      bottom 1.2em
      pointer-events none
      display flex
      flex-direction row
      #start-overlay, #end-overlay
        flex 1
        background $body-background
      #start-overlay
        border-right 1px solid #999
        background: -webkit-gradient(linear, left top, right top, color-stop(10%, #fff), to(rgba(255, 255, 255, 0.7)));
        background: linear-gradient(90deg, #fff 10%, rgba(255, 255, 255, 0.5));
      #end-overlay
        border-left 1px solid #999
        background: -webkit-gradient(linear, right top, left top, color-stop(10%, #fff), to(rgba(255, 255, 255, 0.7)));
        background: linear-gradient(270deg, #fff 10%, rgba(255, 255, 255, 0.5));

</style>
