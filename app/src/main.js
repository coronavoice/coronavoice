// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'

import App from './App'
import router from './router'
import store from '@/store'

import moment from 'vue-moment'
import { sync } from 'vuex-router-sync'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVideo, faStop, faSync, faCloudUploadAlt, faRedo, faMicrophoneAlt, faCircle, faHome, faCog, faHistory, faArrowLeft, faUsersCog, faEdit, faFileAlt, faCaretUp, faCaretDown, faDownload, faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { VueHammer } from 'vue2-hammer'
import './registerServiceWorker'
// Initialize Firebase

sync(store, router)

library.add(faVideo, faStop, faSync, faCloudUploadAlt, faRedo, faMicrophoneAlt, faCircle, faHome, faCog, faHistory, faArrowLeft, faUsersCog, faEdit, faFileAlt, faCaretUp, faCaretDown, faDownload, faCopy)

Vue.use(Vuex)
Vue.use(moment)
Vue.use(VueHammer)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
