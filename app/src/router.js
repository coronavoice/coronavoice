import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import EmailLogin from '@/views/EmailLogin'
import Thankyou from '@/views/Thankyou'
import Feedback from '@/views/Feedback'
import FeedbackHistory from '@/views/FeedbackHistory'
import MediaFeedback from '@/views/MediaFeedback'
import AudioFeedback from '@/views/AudioFeedback'
import TextFeedback from '@/views/TextFeedback'
import UserSettings from '@/views/UserSettings'
import EventList from '@/views/EventList'
import FeedbackDetails from '@/views/FeedbackDetails'
import EventDetails from '@/views/EventDetails'
import AdminHome from '@/views/AdminHome'
import AdminEvents from '@/views/AdminEvents'
import AdminEventDetails from '@/views/AdminEventDetails'
import AdminAddEvent from '@/views/AdminAddEvent'
import PublicCharts from '@/views/PublicCharts'
import Privacy from '@/views/Privacy'
import Terms from '@/views/Terms'

import store from '@/store'
import { config } from '@/config/firebase'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  base: '/',
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      props: true
    },
    {
      path: '/',
      name: 'email-login',
      component: EmailLogin,
      props: true
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: Privacy
    },
    {
      path: '/terms',
      name: 'terms',
      component: Terms
    },
    {
      path: '/public-data/:sessionId',
      name: 'public-data',
      component: PublicCharts,
      props: true
    },
    {
      path: '/settings',
      name: 'user-settings',
      component: UserSettings,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/thankyou/:sessionId',
      name: 'thankyou',
      component: Thankyou,
      props: true,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/event/:sessionId',
      name: 'event',
      component: Feedback,
      props: true,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/media-feedback/:sessionId/:feedbackId',
      name: 'media-feedback',
      component: MediaFeedback,
      props: true,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/audio-feedback/:sessionId/:feedbackId',
      name: 'audio-feedback',
      component: AudioFeedback,
      props: true,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/text-feedback/:sessionId/:feedbackId',
      name: 'text-feedback',
      component: TextFeedback,
      props: true,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/home',
      name: 'home',
      component: EventList,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/history',
      name: 'feedback-history',
      component: FeedbackHistory,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/feedback/:feedbackId',
      name: 'feedback',
      component: FeedbackDetails,
      props: true,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/event-details/:sessionId',
      name: 'event-details',
      component: EventDetails,
      props: true,
      beforeEnter,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminHome,
      beforeEnter,
      meta: {
        requiresAuth: true,
        admin: true
      },
      children: [
        {
          path: '',
          name: 'admin-events',
          component: AdminEvents,
          beforeEnter,
          meta: {
            requiresAuth: true,
            admin: true
          }
        },
        {
          path: '/admin/event/:eventId',
          name: 'admin-event-details',
          component: AdminEventDetails,
          beforeEnter,
          props: true,
          meta: {
            requiresAuth: true,
            admin: true
          }
        },
        {
          path: '/admin/add-event/',
          name: 'admin-add-event',
          component: AdminAddEvent,
          beforeEnter,
          props: true,
          meta: {
            requiresAuth: true,
            admin: true
          }
        }
      ]
    }
  ]
})

/* router.beforeEach((to, from, next) => {
  // console.log('router to')
  // console.log(to)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (authenticated) {
      next()
      return
    }
    next('/')
  } else {
    next()
  }
}) */

firebase.initializeApp(config)

async function beforeEnter (to, from, next) {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (await authenticated()) {
      console.log('authenticated')
      if (to.matched.some(record => record.meta.admin) && store.state.currentUser.userRole !== 'admin') {
        next('/home')
      }
      next()
      return
    }
    next({ name: 'login', params: { to: to } })
  } else {
    next()
  }
}

const initializeAuth = new Promise(resolve => {
  // this adds a hook for the initial auth-change event
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // this.loggedIn = true
      store.dispatch('updateUser', user)
      store.dispatch('updateRole', user.userRole)
    } else {
      // console.log('not logged in')
      // this.loggedIn = false
      store.dispatch('updateUser', null)
    }
    resolve(user)
  })
})

function authenticated () {
  return initializeAuth.then(user => {
    return user || store.state.currentUser
  })
}

export default router
