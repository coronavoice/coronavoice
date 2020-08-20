const admin = require('firebase-admin');
const serviceAccount = require('../keys/coronavoice-6f07b-firebase-adminsdk-hjm28-0152b92114.json');

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
