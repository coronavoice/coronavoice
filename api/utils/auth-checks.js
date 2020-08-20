const fb = require('../utils/firebase');

// eslint-disable-next-line require-jsdoc
async function checkAuth(idToken) {
  const decoded = await fb.auth().verifyIdToken(idToken);
  return decoded;
}

const authUser = async function(req, res, next) {
  const idToken = req.header('X-Firebase-ID-Token');
  if (!idToken) {
    res.user = {
      error: 'ID token not specified',
    };
    return next();
  }
  try {
    res.user = await checkAuth(idToken);
  } catch (err) {
    res.user = {
      error: 'ID token not specified',
    };
  }
  next();
};

module.exports = {
  checkAuth,
  authUser,
};
