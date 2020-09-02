const admin = require('firebase-admin');
const serviceAccount = require('../keys/firebase.json');

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
