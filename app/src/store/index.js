import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/api'
import { config } from '../config/'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentUser: null,
    userRole: null,
    initLoginCheck: false,
    selectedTimePeriod: { selectedTimePeriod: 'today' },
    selectedRatingFilter: 'all',
    selectedTypeFilter: 'all',
    selectedSessionFilter: 'all'
  },
  mutations: {
    updateUser (state, { user }) {
      state.currentUser = user
      // console.log(state.currentUser)
    },
    updateRole (state, { role }) {
      state.userRole = role
    },
    updateAdminFilter (state, { selectedTimePeriod, selectedRatingFilter, selectedTypeFilter, selectedSessionFilter }) {
      state.selectedTimePeriod = selectedTimePeriod || state.selectedTimePeriod
      state.selectedRatingFilter = selectedRatingFilter || state.selectedRatingFilter
      state.selectedTypeFilter = selectedTypeFilter || state.selectedTypeFilter
      state.selectedSessionFilter = selectedSessionFilter || state.selectedSessionFilter
    }
  },
  actions: {
    updateAdminFilter ({ commit, state }, filter) {
      commit('updateAdminFilter', filter)
    },
    updateUser ({ commit, state }, user) {
      commit('updateUser', { user })
      if (user) {
        api.login({
          userId: user.uid,
          name: user.displayName,
          email: user.email
        }).then((result) => {
          user.userId = result[0].user_id
          user.userRole = result[0].user_role
          commit('updateRole', { role: user.userRole })
        })
      }
    },
    updateRole ({ commit, state }, role) {
      commit('updateRole', { role })
    }
  },
  getters: {
    instance () {
      return config[process.env.VUE_APP_INSTANCE].name || 'thoughtcloud'
    },
    instanceColor () {
      return config[process.env.VUE_APP_INSTANCE].themeColor || '#4192a1'
    },
    instanceLogo () {
      return config[process.env.VUE_APP_INSTANCE].logo
    },
    instanceApi () {
      return config[process.env.VUE_APP_INSTANCE].api || 'https://openlab.ncl.ac.uk/dokku/tcv2-api/'
    },
    instanceBaseUrl () {
      return config[process.env.VUE_APP_INSTANCE].baseUrl || 'http://thoughtcloud.openlab.ncl.ac.uk'
    },
    instancePackageName () {
      return config[process.env.VUE_APP_INSTANCE].packageName || 'uk.ac.ncl.openlab.thoughtcloud'
    },
    instanceDynamicLink () {
      return config[process.env.VUE_APP_INSTANCE].dynamicLink || 'thoughtcloud.page.link'
    },
    instanceHelpDescription () {
      return config[process.env.VUE_APP_INSTANCE].helpDescription || ''
    }
  }
})
