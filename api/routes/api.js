/* eslint-disable max-len */
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const db = require('../utils/db-helper');
const logger = require('../utils/logger');
const axios = require('axios');
const fb = require('../utils/firebase');
const {authUser} = require('../utils/auth-checks');
const dataAnalysis = require('../utils/data-analysis');
const moment = require('moment');
const cooldownVals = [
  'none', 'hour', 'day', 'week', 'month', 'never',
];

router.use(authUser);

const requireAuth = function(res) {
  if (!res.user || !res.user.uid) {
    return false;
  }
  return true;
};

router.put('/admin/event/', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }
    const permission = await db.getUserPermission(user.user_id, req.body.eventId);
    if (!permission || !permission[0]) {
      throw new Error('User not authorised');
    }
    const result = await db.modifyEvent(req.body);
    res.json(result);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.put('/admin/session/', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }
    const permission = await db.getUserPermission(user.user_id, req.body.eventId);
    if (!permission || !permission[0]) {
      throw new Error('User not authorised');
    }
    const session = {...req.body};
    session.metadata = JSON.stringify(session.metadata);

    const result = await db.modifySession(session);
    res.json(result);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.post('/admin/session/', async function(req, res, next) {
  try {
    console.log('creating session');
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }
    const permission = await db.getUserPermission(user.user_id, req.body.eventId);
    if (!permission || !permission[0]) {
      throw new Error('User not authorised');
    }

    const joincodes = [];

    for (let i = 0; i < 15; i++) {
      joincodes.push(generateJoinCode());
    }

    const joincodeCheck = await db.checkSessionJoincodes(joincodes);
    joincodeCheck.forEach((el) => {
      const index = joincodes.indexOf(el.join_code);
      console.log(el.join_code);
      if (index >= 0) joincodes.splice(index, 1);
    });

    const session = {...req.body};
    session.joinCode = joincodes[0];
    console.log(session.metadata);
    session.metadata = JSON.stringify(session.metadata);

    const result = await db.createSession(session);
    console.log('creating session');
    console.log(result);
    const headers = {
      'Content-Type': 'application/json',
    };
    const data = {
      'dynamicLinkInfo': {
        'domainUriPrefix': process.env.APP_DYNAMIC_LINK,
        'link': process.env.APP_WEB_LINK + '/#/event/' + result.insertId,
        'androidInfo': {
          'androidPackageName': process.env.APP_PACKAGE_NAME,
          'androidFallbackLink': process.env.APP_WEB_LINK + '/#/event/' + result.insertId,
        },
        'iosInfo': {
          'iosBundleId': process.env.APP_PACKAGE_NAME,
          'iosFallbackLink': process.env.APP_WEB_LINK + '/#/event/' + result.insertId,
        },
      },
      'suffix': {
        'option': 'SHORT',
      },
    };
    axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FB_WEB_KEY}`, data, {
      headers: headers,
    })
        .then(async (fblink) => {
          // TODO: CHANGE THIS TO CREATE A SESSION
          await db.addSessionFBLink(fblink.data.shortLink, result.insertId);
          res.json(result);
        })
        .catch((err) => {
          console.log(err);
          res.json(result);
        });
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/admin/eventdetails/:eventId', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }
    const event = await db.getEventSessionsByEventId(req.params.eventId);
    res.json(event);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/admin/eventfeedback/:eventId', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }

    // const to = moment().startOf('hour').diff(moment(req.query.to)) >= 0 ? moment(req.query.to) : moment().startOf('hour');
    // const event = await db.getFeedbackByEventId(req.params.eventId, moment(req.query.from).format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss', moment().startOf('hour').format('YYYY/MM/DD HH:mm:ss')));
    const to = moment().diff(moment(req.query.to)) >= 0 ? moment(req.query.to) : moment();
    const event = await db.getFeedbackByEventId(req.params.eventId, moment(req.query.from).format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss')));

    res.json({event, to});
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/admin/eventstats/:eventId', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }

    const to = moment(req.query.to) ? moment(req.query.to) : moment();
    const from = to.diff(moment(req.query.from)) >= 0 ? moment(req.query.from).startOf(req.query.timeperiod === 'today' ? 'hour' : 'day') : moment(0);
    let dayDiff = to.diff(from, 'days');
    dayDiff += 1;

    let result; let stats;
    let compareTo; let compareFrom;

    switch (req.query.timeperiod) {
      case 'allTime':
        result = [{
          event: await db.getFeedbackForCharts(req.params.eventId, null, null, true),
          from: moment(req.query.from) || moment(0),
          to: moment(),
          returningUsers: await db.getUserFeedbackCount(req.params.eventId, null, null, true),
        }];

        stats = await dataAnalysis(req.params.eventId, from, to, dayDiff, 'stats', true);
        break;

      case 'thisWeek':
        const weekFrom = moment(to).startOf('isoWeek');
        const weekTo = moment(weekFrom).add(1, 'weeks');
        result = [{
          event: await db.getFeedbackForCharts(req.params.eventId, weekFrom.format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
          from: moment(weekFrom),
          to: moment(to),
          returningUsers: await db.getUserFeedbackCount(req.params.eventId, weekFrom.format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
        }];

        compareFrom = moment(weekFrom).add(-1, 'weeks');
        compareTo = moment(compareFrom).endOf('isoWeek');
        result.push({
          event: await db.getFeedbackForCharts(req.params.eventId, compareFrom.format('YYYY/MM/DD HH:mm:ss'), compareTo.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
          from: compareFrom,
          to: compareTo,
          returningUsers: await db.getUserFeedbackCount(req.params.eventId, compareFrom.format('YYYY/MM/DD HH:mm:ss'), compareTo.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
        });


        stats = await dataAnalysis(req.params.eventId, weekFrom, weekTo, weekTo.diff(weekFrom, 'days'), 'stats');
        break;

      default:
        result = [{
          event: await db.getFeedbackForCharts(req.params.eventId, moment(from).format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
          from: moment(from),
          to: moment(to),
          returningUsers: await db.getUserFeedbackCount(req.params.eventId, from.format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
        }];

        compareTo = moment(to);
        compareFrom = moment(from);
        if (dayDiff <=40) {
          compareTo = moment(from);
          compareFrom.add(-1 * dayDiff, 'days');
          result.push({
            event: await db.getFeedbackForCharts(req.params.eventId, compareFrom.format('YYYY/MM/DD HH:mm:ss'), compareTo.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
            from: compareFrom,
            to: compareTo,
            returningUsers: await db.getUserFeedbackCount(req.params.eventId, compareFrom.format('YYYY/MM/DD HH:mm:ss'), compareTo.format('YYYY/MM/DD HH:mm:ss', moment().format('YYYY/MM/DD HH:mm:ss'))),
          });
        }

        stats = await dataAnalysis(req.params.eventId, from, to, dayDiff, 'stats');
        break;
    }

    res.json({result, stats});
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/admin/eventsentiment/:eventId', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }

    const to = moment(req.query.to) ? moment(req.query.to) : moment();
    const from = to.diff(moment(req.query.from)) >= 0 ? moment(req.query.from).startOf(req.query.timeperiod === 'today' ? 'hour' : 'day') : moment(0);
    let dayDiff = to.diff(from, 'days');
    dayDiff += 1;

    let result; let sentiment;

    switch (req.query.timeperiod) {
      case 'allTime':
        sentiment = await dataAnalysis(req.params.eventId, from, to, dayDiff, 'sentiment', true);
        break;

      case 'thisWeek':
        const weekFrom = moment(to).startOf('isoWeek');
        const weekTo = moment(weekFrom).endOf('isoWeek');
        sentiment = await dataAnalysis(req.params.eventId, weekFrom, weekTo, weekTo.diff(weekFrom, 'days'), 'sentiment');
        break;

      default:
        sentiment = await dataAnalysis(req.params.eventId, from, to, dayDiff, 'sentiment');
        break;
    }

    res.json({result, sentiment});
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/admin/eventcomments/:eventId', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }

    const to = moment(req.query.to) ? moment(req.query.to) : moment();
    const from = to.diff(moment(req.query.from)) >= 0 ? moment(req.query.from) : moment(0);

    let dayDiff = to.diff(from, 'days');
    dayDiff += 1;

    const comments = await dataAnalysis(req.params.eventId, from, to, dayDiff, 'comments');

    res.json({comments});
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/admin/event/', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }
    const event = await db.getEventByUserId(user.user_id);
    res.json(event);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/event/:id', async function(req, res, next) {
  try {
    const event = await db.getEventById(req.params.id);
    res.json(event);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/session/:id', async function(req, res, next) {
  try {
    const event = await db.getSessionEventById(req.params.id);
    res.json(event);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/joinsession/:joincode', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const event = await db.getSessionByJoincode(req.params.joincode.trim().toUpperCase());
    res.json({id: event[0].session_id});
    const user = (await db.getUserByFBId(res.user.uid))[0];
    db.getSessionSubscription(user.user_id, event[0].session_id)
        .then((result) => {
          if (!result || result.length == 0) {
            db.addSubscription({
              eventId: event[0].event_id,
              sessionId: event[0].session_id,
              userId: user.user_id,
              subscribed: true,
            });
          }
        });
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/userEvents/:userId', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    Promise.all([db.getEventsAvailableForUserId(user.user_id),
      db.getLastFeedbackForUser(user.user_id)])
        .then((values) => {
          const sessions = [];
          const lastFeedback = {};
          for (let i = 0; i < values[1].length; i++) {
            lastFeedback[values[1][i].session_id] = values[1][i].max_date;
          }
          const availableEvents = [];
          const pastEvents = [];
          for (let i = 0; i < values[0].length; i++) {
            const event = values[0][i];
            if (sessions.indexOf(event.session_id) >= 0) continue;
            sessions.push(event.session_id);
            if (event.event_status != 1 || event.session_status != 1) {
              pastEvents.push(event);
              continue;
            }

            switch (cooldownVals[event.cooldown]) {
              case 'none':
                availableEvents.push(event);
                break;
              case 'never':
                if (lastFeedback[event.session_id]) {
                  pastEvents.push(event);
                } else {
                  availableEvents.push(event);
                }
                break;
              case 'hour': case 'day': case 'week':
                console.log(moment(lastFeedback[event.session_id]).add(1, cooldownVals[event.cooldown]).isAfter(moment()));
                if (lastFeedback[event.session_id]
                  && moment(lastFeedback[event.session_id]).add(1, cooldownVals[event.cooldown]).isAfter(moment())) {
                  pastEvents.push(event);
                } else {
                  availableEvents.push(event);
                }
                break;
            }
          }
          res.json({availableEvents, pastEvents});
        }).catch((e) => {
          logger.tcv2.error(e);
          res.status(500).send(e.message);
        });
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/feedbackHistory', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    const userFeedback = await db.getFeedbackHistoryForUser(user.user_id);
    res.json(userFeedback);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/feedback/:feedbackId', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    const userFeedback = await db.getFeedbackItemForUser(user.user_id, req.params.feedbackId);
    res.json(userFeedback[0]);
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/checkuser', async function(req, res, next) {
  try {
    const user = await db.getUserByEmail(req.query.email);
    if (!user || user.length == 0) {
      res.json({exists: false});
    } else {
      res.json({exists: true});
    }
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/sessionpublicdata/:sessionId', async function(req, res, next) {
  try {
    // const date = moment().startOf('hour').format('YYYY/MM/DD HH:mm:ss');
    const date = moment().format('YYYY/MM/DD HH:mm:ss');
    const session = await db.getSessionEventById(req.params.sessionId);
    let data = [];
    if (session && session[0].show_results) {
      data = await db.getSessionFeedbackRatings(req.params.sessionId, date);
    }
    res.json({
      data,
      date,
    });
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.get('/displaydata/:sessionId', async function(req, res, next) {
  try {
    // const date = moment.utc().startOf('hour');
    const date = moment.utc();
    const session = await db.getSessionEventById(req.params.sessionId);
    const from = '1971/1/1 00:00:00';
    let data = [];
    if (session && session[0].show_results) {
      // const to = moment().startOf('hour').diff(moment(req.query.to)) >= 0 ? moment(req.query.to) : moment().startOf('hour');
      const to = moment().diff(moment(req.query.to)) >= 0 ? moment(req.query.to) : moment();
      data = await db.getPublicFeedbackBySessionId(req.params.sessionId, from, to.format('YYYY/MM/DD HH:mm:ss'));
    }
    res.json({
      data,
      date,
    });
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.post('/login', async function(req, res, next) {
  try {
    const user = await db.getUserByFBId(req.body.userId);
    if (!user || user.length == 0) {
      const newUser = await db.createUser({
        userFBId: req.body.userId,
        email: req.body.email,
        name: req.body.name,
        metadata: null,
      });
      const userData = await db.getUserById(newUser.insertId);

      res.json(userData);
    } else {
      res.json(user);
    }
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.post('/signup', async function(req, res, next) {
  try {
    const user = await db.getUserByEmail(req.body.email);
    if (!user || user.length == 0) {
      fb.auth().createUser({
        email: req.body.email,
        displayName: req.body.name,
      }).then(async (result) => {
        const newUser = await db.createUser({
          userFBId: result.uid,
          email: req.body.email,
          name: req.body.name,
          metadata: null,
        });
        const userData = await db.getUserById(newUser.insertId);
        res.json(userData);
      });
    } else {
      res.json(user);
    }
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.post('/feedback', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    const session = await db.getSessionEventById(req.body.sessionId);
    if (!session || session.length == 0 || session[0].session_status != 1 || session[0].event_status != 1) {
      throw new Error('Cannot submit to this session');
    }
    const lastFeedbackDb = await db.getLastFeedbackForUser(user.user_id);
    const lastFeedback = {};
    for (let i = 0; i < lastFeedbackDb.length; i++) {
      lastFeedback[lastFeedbackDb[i].session_id] = lastFeedbackDb[i].max_date;
    }

    switch (cooldownVals[session[0].cooldown]) {
      case 'none':
        break;
      case 'never':
        if (lastFeedback[session[0].session_id]) {
          throw new Error('User has recently submitted');
        }
        break;
      case 'hour': case 'day': case 'week':
        if (lastFeedback[session[0].session_id]
          && moment(lastFeedback[session[0].session_id]).add(1, cooldownVals[session[0].cooldown]).isAfter(moment())) {
          throw new Error('User has recently submitted');
        }
        break;
    }
    const feedback = await db.insertFeedbackS1({
      eventId: req.body.eventId,
      sessionId: req.body.sessionId,
      userId: user.user_id,
      rating: req.body.rating,
    });
    db.getSessionSubscription(req.body.userId, req.body.sessionId)
        .then((result) => {
          if (!result || result.length == 0) {
            db.addSubscription({
              eventId: req.body.eventId,
              sessionId: req.body.sessionId,
              userId: user.user_id,
              subscribed: true,
            });
          }
        });
    res.json({feedbackId: feedback.insertId});
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.post('/mediafeedback', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    db.insertFeedbackS2({
      feedbackId: req.body.feedbackId,
      userId: user.user_id,
      feedbackType: req.body.type,
      fileLocation: req.body.location,
      publicConsent: req.body.consent_public || false,
      extraData: (req.body.text_feedback ? JSON.stringify({text_feedback: req.body.text_feedback}) : null),
    });

    res.json({success: true});
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

router.post('/admin/event/', async function(req, res, next) {
  try {
    if (!requireAuth(res)) throw new Error('User not logged in');
    const user = (await db.getUserByFBId(res.user.uid))[0];
    if (user.user_role != 'admin') {
      throw new Error('User not authorised');
    }
    console.log('folowup');
    console.log(!!req.body.event.followUpEnabled);
    console.log(req.body.event.followUpEnabled);
    const event = {
      userId: user.user_id,
      name: req.body.event.name && req.body.event.name.trim(),
      question: req.body.event.question && req.body.event.question.trim(),
      followUpEnabled: !!req.body.event.followUpEnabled,
      followUpLabel: (req.body.event.followUpLabel && req.body.event.followUpLabel.trim())
      || (req.body.event.question && req.body.event.question.trim()),
      extraFields: JSON.stringify(req.body.event.extraFields || {}),
      showResults: !!req.body.event.showResults,
      showFeedback: !!req.body.event.showFeedback,
      status: req.body.event.status,
      target: JSON.stringify({}),
      cooldownPeriod: req.body.event.cooldownPeriod || 0,
      expiryDate: null,
    };

    const newEvent = await db.createEvent(event);
    await db.createPermission(user.user_id, newEvent.insertId);

    const joincodes = [];

    for (let i = 0; i < 15; i++) {
      joincodes.push(generateJoinCode());
    }

    const joincodeCheck = await db.checkSessionJoincodes(joincodes);
    joincodeCheck.forEach((el) => {
      const index = joincodes.indexOf(el.join_code);
      console.log(el.join_code);
      if (index >= 0) joincodes.splice(index, 1);
    });

    const session = {...req.body.session};
    session.joinCode = joincodes[0];
    session.metadata = JSON.stringify(session.metadata);
    session.eventId = newEvent.insertId;

    const result = await db.createSession(session);

    const headers = {
      'Content-Type': 'application/json',
    };
    const data = {
      'dynamicLinkInfo': {
        'domainUriPrefix': process.env.APP_DYNAMIC_LINK,
        'link': process.env.APP_WEB_LINK + '/#/event/' + result.insertId,
        'androidInfo': {
          'androidPackageName': process.env.APP_PACKAGE_NAME,
          'androidFallbackLink': process.env.APP_WEB_LINK + '/#/event/' + result.insertId,
        },
        'iosInfo': {
          'iosBundleId': process.env.APP_PACKAGE_NAME,
          'iosFallbackLink': process.env.APP_WEB_LINK + '/#/event/' + result.insertId,
        },
      },
      'suffix': {
        'option': 'SHORT',
      },
    };
    axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FB_WEB_KEY}`, data, {
      headers: headers,
    })
        .then(async (fblink) => {
          // TODO: CHANGE THIS TO CREATE A SESSION
          await db.addSessionFBLink(fblink.data.shortLink, result.insertId);
          res.json(newEvent);
        })
        .catch((err) => {
          console.log(err);
          res.json(newEvent);
        });
  } catch (e) {
    logger.tcv2.error(e);
    res.status(500).send(e.message);
  }
});

// eslint-disable-next-line require-jsdoc
function randChar() {
  return String.fromCharCode(Math.floor(Math.random()*26)+65);
}

// eslint-disable-next-line require-jsdoc
function generateJoinCode() {
  return randChar() + randChar() + randChar() + randChar() + randChar();
}

module.exports = router;
