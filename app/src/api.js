import axios from 'axios'
import firebase from 'firebase'
import { config } from '@/config'

const client = axios.create({
  // baseURL: 'http://localhost:4444/api/',
  baseURL: config[process.env.VUE_APP_INSTANCE].api + 'api/',
  json: true
})

export default {
  async execute (method, resource, data, contentType = 'application/json') {
    // inject the accessToken for each request
    const token = firebase.auth().currentUser ? await firebase.auth().currentUser.getIdToken(true) : null
    return client({
      method,
      url: resource,
      data,
      headers: {
        'Content-Type': contentType,
        'X-Firebase-ID-Token': token
      }
    })
      .then(req => {
        return req.data
      })
      .catch(error => {
        // console.log(error.response)
        return { error: true, errorMessage: error.response }
      })
  },
  checkUser (email) {
    return this.execute('get', `/checkuser?email=${encodeURIComponent(email)}`)
  },
  login (data) {
    return this.execute('post', '/login', data)
  },
  signup (data) {
    return this.execute('post', '/signup', data)
  },
  getUserEvents (userId) {
    return this.execute('get', `/userEvents/${userId}`)
  },
  getEvent (eventId) {
    return this.execute('get', `/event/${eventId}`)
  },
  getSessionEvent (sessionId) {
    return this.execute('get', `/session/${sessionId}`)
  },
  getSessionId (joincode) {
    return this.execute('get', `/joinsession/${joincode}`)
  },
  getSessionRatings (sessionId) {
    return this.execute('get', `/sessionpublicdata/${sessionId}`)
  },
  getPublicFeedback (sessionId) {
    return this.execute('get', `/displaydata/${sessionId}`)
  },
  getFeedbackHistory () {
    return this.execute('get', `/feedbackHistory/`)
  },
  getFeedbackItem (feedbackId) {
    return this.execute('get', `/feedback/${feedbackId}`)
  },
  submitFeedback (data) {
    return this.execute('post', '/feedback', data)
  },
  submitMediaFeedback (data) {
    return this.execute('post', '/mediafeedback', data)
  },

  getSessions (wsId) {
    return this.execute('get', `/sessions/${wsId}`)
  },
  getVisualization (sessionId) {
    return this.execute('get', `/visualization/${sessionId}`)
  },
  getSession (wsId, sessionId) {
    return this.execute('get', `/workshops/${wsId}/${sessionId}`)
  },
  getSignedS3 (filename, filetype, uploadtype) {
    filename = encodeURIComponent(filename)
    filetype = encodeURIComponent(filetype)
    uploadtype = encodeURIComponent(uploadtype)
    return this.execute(
      'get',
      `/s3_upload?filename=${filename}&filetype=${filetype}&uploadtype=${uploadtype}`
    )
  },

  finishSession (id, sid) {
    return this.execute('post', `/workshops/${id}/${sid}/finish`)
  },
  addRecording (data) {
    return this.execute('post', `/recordings`, data)
  },
  updateWorkshop (id, data) {
    return this.execute('put', `/workshops/${id}`, data)
  },

  getAdminEvents (id, data) {
    return this.execute('get', `/admin/event/`, data)
  },
  getAdminEventDetails (id, data) {
    return this.execute('get', `/admin/eventdetails/${id}`, data)
  },
  getAdminEventFeedback (id, from, to, data) {
    // return this.execute('get', `/admin/eventstats/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, data)
    return this.execute('get', `/admin/eventfeedback/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, data)
  },
  getAdminEventComments (id, from, to, data) {
    // return this.execute('get', `/admin/eventstats/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, data)
    return this.execute('get', `/admin/eventcomments/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, data)
  },
  getAdminEventSentiment (id, from, to, timePeriod, data) {
    // return this.execute('get', `/admin/eventstats/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, data)
    return this.execute('get', `/admin/eventsentiment/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${timePeriod ? '&timeperiod=' + timePeriod : ''}`, data)
  },
  getAdminEventStats (id, from, to, timePeriod, data) {
    return this.execute('get', `/admin/eventstats/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${timePeriod ? '&timeperiod=' + timePeriod : ''}`, data)
    // return this.execute('get', `/admin/eventfeedback/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, data)
  },
  createEvent (data) {
    return this.execute('post', '/admin/event/', data)
  },
  updateEvent (data) {
    return this.execute('put', `/admin/event/`, data)
  },
  createSession (data) {
    return this.execute('post', `/admin/session/`, data)
  },
  updateSession (data) {
    return this.execute('put', `/admin/session/`, data)
  },
  async uploadFile (signedUrl, file) {
    var options = {
      headers: {
        'Content-Type': file.type
      }
    }
    return axios
      .put(signedUrl, file, options)
      .then(req => {
        // console.log(req.data)
        return req.data
      })
      .catch(error => {
        // console.log(error.response)
        return { error: true, errorMessage: error.response }
      })
  }
}
