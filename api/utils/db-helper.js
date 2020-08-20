/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const mysql = require('mysql');
const axios = require('axios');
const logger = require('../utils/logger');
const moment = require('moment');

class DbHelper {
  constructor() {
    this.initDatabase();
  }

  async initDatabase() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER_NAME,
      port: process.env.DB_PORT,
      password: process.env.DB_USER_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      connectionLimit: 8,
      supportBigNumbers: true,
      multipleStatements: true,
    });
  }

  execQuery(sqlQuery, queryArgs, logger) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          logger.error(err);
          logger.info({
            sqlQuery,
            queryArgs,
          });
          reject(new Error(err));
          return;
        }
        connection.query(sqlQuery, queryArgs, function(err, results) {
          connection.release();
          if (err) {
            logger.info({
              sqlQuery,
              queryArgs,
            });
            logger.error(err);
            reject(new Error(err));
            return;
          }
          resolve(results);
        });
      });
    });
  }

  getUserByEmail(email) {
    const sqlQuery = 'SELECT * FROM user WHERE email = ?';
    return this.execQuery(sqlQuery, [email], logger.tcv2);
  }

  getEventsAvailableForUserId(userId) {
    const currentTime = moment().endOf('day').format('YYYY/MM/DD HH:mm:ss');
    // const sqlQuery = 'SELECT  session.session_id AS session_id, session.event_id AS event_id, owner_id, session.name AS session_name, event.name AS event_name, event.question, session.status AS session_status, event.status AS event_status, privacy, session.date_created AS date_created, session.date_modified AS date_modified, sub_id, user_id, subscribed, subscription.date_created AS sub_date_created, subscription.date_modified AS sub_date_modified FROM session INNER JOIN event ON session.event_id = event.event_id LEFT OUTER JOIN subscription ON session.session_id = subscription.session_id AND subscription.user_id = ? WHERE privacy = 1 AND session.status = 1 AND event.status = 1 UNION SELECT  session.session_id AS session_id, session.event_id AS event_id, owner_id, session.name AS session_name, event.name AS event_name, event.question, session.status AS session_status, event.status AS event_status, privacy, session.date_created AS date_created, session.date_modified AS date_modified, sub_id, user_id, subscribed, subscription.date_created AS sub_date_created, subscription.date_modified AS sub_date_modified FROM session INNER JOIN event ON session.event_id = event.event_id RIGHT OUTER JOIN subscription ON session.session_id = subscription.session_id AND subscription.user_id = ? WHERE session.status = 1 AND event.status = 1 AND user_id = ?;';
    const sqlQuery = 'SELECT * FROM user_events WHERE user_id = ? OR privacy = 1';
    return this.execQuery(sqlQuery, [userId], logger.tcv2);
  }

  getEventById(eventId) {
    const sqlQuery = 'SELECT * FROM event WHERE event_id = ?';
    return this.execQuery(sqlQuery, [eventId], logger.tcv2);
  }

  getSessionById(sessionId) {
    const sqlQuery = 'SELECT * FROM session WHERE session_id = ?';
    return this.execQuery(sqlQuery, [sessionId], logger.tcv2);
  }

  getSessionByJoincode(joincode) {
    const sqlQuery = 'SELECT * FROM session WHERE join_code = ?';
    return this.execQuery(sqlQuery, [joincode], logger.tcv2);
  }

  checkSessionJoincodes(joincodes) {
    const sqlQuery = 'SELECT join_code FROM session WHERE join_code IN (?)';
    return this.execQuery(sqlQuery, [joincodes], logger.tcv2);
  }

  getSessionEventById(sessionId) {
    const sqlQuery = 'SELECT * FROM session_event WHERE session_id = ?';
    return this.execQuery(sqlQuery, [sessionId], logger.tcv2);
  }

  getEventSessionsByEventId(eventId) {
    const sqlQuery = 'SELECT * FROM session_event WHERE event_id = ?';
    return this.execQuery(sqlQuery, [eventId], logger.tcv2);
  }

  getFeedbackByEventId(eventId, from, to, all) {
    const sqlQuery = all ? 'SELECT * FROM feedback WHERE event_id = ?' : 'SELECT * FROM feedback WHERE event_id = ? AND date_created <= ? AND date_created >= ?';
    return this.execQuery(sqlQuery, [eventId, to, from], logger.tcv2);
  }

  getFeedbackForCharts(eventId, from, to, all) {
    const sqlQuery = all ? 'SELECT event_id, session_id, rating, date_created FROM feedback WHERE event_id = ?' : 'SELECT event_id, session_id, rating, date_created FROM feedback WHERE event_id = ? AND date_created <= ? AND date_created >= ?';
    return this.execQuery(sqlQuery, [eventId, to, from], logger.tcv2);
  }

  getFeedbackForStats(eventId, from, to, all) {
    const sqlQuery = all ? 'SELECT session.session_id as SessionId, session.name as Name, feedback.rating as Rating, feedback.date_created as Date_Created, NOT isnull(extra_data) as HasComment FROM feedback LEFT JOIN session ON feedback.session_id = session.session_id WHERE feedback.event_id = ?' : 'SELECT session.session_id as SessionId, session.name as Name, feedback.rating as Rating, feedback.date_created as Date_Created, NOT isnull(extra_data) as HasComment FROM feedback LEFT JOIN session ON feedback.session_id = session.session_id WHERE feedback.event_id = ? AND feedback.date_created <= ? AND feedback.date_created >= ?';
    return this.execQuery(sqlQuery, [eventId, to, from], logger.tcv2);
  }

  getFeedbackForSentiment(eventId, from, to, all) {
    const sqlQuery = all ? 'SELECT session.session_id as SessionId, session.name as Name, feedback.rating as Rating, feedback.date_created as Date_Created, feedback.extra_data as Comment, feedback.extra_feedback_type as FeedbackType, feedback.file_location as FileLocation, feedback.consent_public as ConsentType FROM feedback LEFT JOIN session ON feedback.session_id = session.session_id WHERE feedback.event_id = ? AND feedback.extra_feedback_type <> 0' : 'SELECT session.session_id as SessionId, session.name as Name, feedback.rating as Rating, feedback.date_created as Date_Created, feedback.extra_data as Comment, feedback.extra_feedback_type as FeedbackType, feedback.file_location as FileLocation, feedback.consent_public as ConsentType FROM feedback LEFT JOIN session ON feedback.session_id = session.session_id WHERE feedback.event_id = ? AND feedback.date_created <= ? AND feedback.date_created >= ? AND feedback.extra_feedback_type <> 0';
    // extra_data IS NOT NULL
    return this.execQuery(sqlQuery, [eventId, to, from], logger.tcv2);
  }

  getUserFeedbackCount(eventId, from, to, all) {
    const sqlQuery = all ? 'SELECT COUNT(*) as total_users FROM (SELECT user_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE feedback.event_id = ? GROUP BY user_id) AS t; SELECT COUNT(*) AS returning_users FROM (SELECT user_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE feedback.event_id = ? GROUP BY user_id) AS t WHERE c > 1; SELECT session_id, count(*) as total_users FROM (SELECT user_id, session_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE event_id = ? GROUP BY user_id, session_id) AS t GROUP BY session_id; SELECT session_id, count(*) as returning_users FROM (SELECT user_id, session_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE event_id = ? GROUP BY user_id, session_id) AS t WHERE c > 1 GROUP BY session_id' : 'SELECT COUNT(*) as total_users FROM (SELECT user_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE feedback.event_id = ? GROUP BY user_id) AS t WHERE max_date <= ? AND max_date >= ?; SELECT COUNT(*) AS returning_users FROM (SELECT user_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE feedback.event_id = ? GROUP BY user_id) AS t WHERE max_date <= ? AND max_date >= ? AND c > 1; SELECT session_id, count(*) as total_users FROM (SELECT user_id, session_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE event_id = ? GROUP BY user_id, session_id) AS t WHERE max_date <= ? AND max_date >= ? GROUP BY session_id; SELECT session_id, count(*) as returning_users FROM (SELECT user_id, session_id, max(CAST(date_created AS Date)) as max_date, count(*) as c FROM feedback WHERE event_id = ? GROUP BY user_id, session_id) AS t WHERE max_date <= ? AND max_date >= ? AND c > 1 GROUP BY session_id';
    return this.execQuery(sqlQuery, all ? [eventId, eventId, eventId, eventId] : [eventId, to, from, eventId, to, from, eventId, to, from, eventId, to, from], logger.tcv2);
  }

  getSessionIds(eventId) {
    const sqlQuery = 'SELECT session_id AS SessionId FROM session WHERE event_id = ?;';
    return this.execQuery(sqlQuery, [eventId], logger.tcv2);
  }

  getPublicFeedbackBySessionId(sessionId, from, to) {
    const sqlQuery = 'SELECT feedback_id, event_id, session_id, rating, date_created, date_modified FROM feedback WHERE session_id = ? AND date_created <= ? AND date_created >= ? ORDER BY date_created';
    return this.execQuery(sqlQuery, [sessionId, to, from], logger.tcv2);
  }

  getEventByOwnerId(userId) {
    const sqlQuery = 'SELECT * FROM event WHERE owner_id = ?';
    return this.execQuery(sqlQuery, [userId], logger.tcv2);
  }

  getEventByUserId(userId) {
    const sqlQuery = 'SELECT event.* FROM user_permission LEFT JOIN event ON event.event_id = user_permission.event_id WHERE user_id = ?';
    return this.execQuery(sqlQuery, [userId], logger.tcv2);
  }

  getUserPermission(userId, eventId) {
    const sqlQuery = 'SELECT * FROM user_permission WHERE user_id = ? AND event_id = ?';
    return this.execQuery(sqlQuery, [userId, eventId], logger.tcv2);
  }

  createPermission(userId, eventId) {
    const sqlQuery = 'INSERT INTO user_permission (event_id, user_id, date_created, date_modified) VALUES (?, ?, ?, ?)';
    const values = [eventId, userId, new Date(), new Date()];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }


  createEvent(event) {
    const sqlQuery = 'INSERT INTO event (owner_id, name, question, followup_enabled, followup_label, extra_fields, show_results, show_feedback, status, target, cooldown_period, date_created, date_modified, expiry_date, description, thanks_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [event.userId, event.name, event.question, event.followUpEnabled, event.followUpLabel, event.extraFields, event.showResults, event.showFeedback, event.status, event.target, event.cooldownPeriod, new Date(), new Date(), event.expiryDate, event.description, event.thanksText];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  modifyEvent(event) {
    const sqlQuery = 'UPDATE event SET name = ?, question = ?, followup_enabled = ?, followup_label = ?, extra_fields = ?, show_results = ?, show_feedback = ?, status = ?, cooldown_period = ?, description = ?, thanks_text = ?, date_modified = ?, expiry_date = ? WHERE event_id = ?';

    const values = [event.name, event.question, event.followupEnabled, event.followupLabel, event.extraFields, event.showResults, event.showFeedback, event.status, event.cooldownPeriod, event.description, event.thanksText, new Date(), event.expiryDate, event.eventId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  createSession(event) {
    const sqlQuery = 'INSERT INTO session (event_id, name, metadata, status, privacy, join_code, date_created, date_modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [event.eventId, event.name, event.metadata, event.status, event.privacy, event.joinCode, new Date(), new Date()];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  modifySession(event) {
    const sqlQuery = 'UPDATE session SET name = ?, metadata = ?, status = ?, privacy = ?, date_modified = ? WHERE session_id = ?';

    const values = [event.name, event.metadata, event.status, event.privacy, new Date(), event.sessionId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  addSessionFBLink(FBLink, sessionId) {
    const sqlQuery = 'UPDATE session SET fb_link = ? WHERE session_id = ?';
    const values = [FBLink, sessionId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  getUserById(userId) {
    const sqlQuery = 'SELECT * FROM user WHERE user_id = ?';
    return this.execQuery(sqlQuery, [userId], logger.tcv2);
  }

  getUserByFBId(userFBId) {
    const sqlQuery = 'SELECT * FROM user WHERE user_fb_id = ?';
    return this.execQuery(sqlQuery, [userFBId], logger.tcv2);
  }

  createUser(user) {
    const sqlQuery = 'INSERT INTO user (user_fb_id, email, date_created, name, metadata, date_modified) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [user.userFBId, user.email, new Date(), user.name, user.metadata, new Date()];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  modifyUser(user) {
    const sqlQuery = 'UPDATE user SET name = ?, metadata = ?, date_modified = ? WHERE user_id = ?';
    const values = [user.name, user.metadata, new Date(), user.userId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  getFeedbackHistoryForUser(userId) {
    const sqlQuery = 'SELECT feedback_id, feedback.event_id, user_id, rating, extra_feedback_type, file_location, feedback.date_created, question, event_name, session_name, feedback.session_id, event_status, session_status, session_fb_link FROM feedback LEFT JOIN session_event ON session_event.session_id = feedback.session_id WHERE user_id = ? ORDER BY date_created DESC';
    const values = [userId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  getFeedbackItemForUser(userId, feedbackId) {
    const sqlQuery = 'SELECT feedback_id, feedback.event_id, user_id, rating, extra_feedback_type, file_location, extra_data, feedback.date_created, question, event_name, session_name, feedback.session_id, event_status, session_status, session_fb_link, description FROM feedback LEFT JOIN session_event ON session_event.session_id = feedback.session_id WHERE user_id = ? AND feedback_id = ? ORDER BY date_created DESC';
    const values = [userId, feedbackId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  getSessionFeedbackRatings(sessionId, date) {
    const sqlQuery = 'SELECT count(*) as count, rating FROM feedback WHERE session_id = ? AND date_created < ? GROUP BY rating ;';
    const values = [sessionId, date];
    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  getLastFeedbackForUser(userId) {
    const sqlQuery = 'SELECT session_id, MAX(date_created) AS max_date FROM feedback WHERE user_id = ? group by session_id;';
    const values = [userId];
    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  insertFeedbackS1(feedback) {
    const sqlQuery = 'INSERT INTO feedback (event_id, session_id, user_id, rating, date_created) VALUES (?, ?, ?, ?, ?)';
    const values = [feedback.eventId, feedback.sessionId, feedback.userId, feedback.rating, new Date()];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  insertFeedbackS2(feedback) {
    const sqlQuery = 'UPDATE feedback SET extra_feedback_type = ?, file_location = ?, consent_public = ?, extra_data = ? WHERE feedback_id = ? AND user_id = ?';
    const values = [feedback.feedbackType, feedback.fileLocation, feedback.publicConsent, feedback.extraData || null, feedback.feedbackId, feedback.userId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  addSubscription(subscription) {
    const sqlQuery = 'INSERT INTO subscription (event_id, session_id, user_id, subscribed, date_created, date_modified) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [subscription.eventId, subscription.sessionId, subscription.userId, subscription.subscribed, new Date(), new Date()];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  modifySubscription(subscription) {
    const sqlQuery = 'UPDATE subscription SET subscribed = ?, date_modified = ? WHERE sub_id = ?';
    const values = [subscription.subscribed, new Date(), subscription.subId];

    return this.execQuery(sqlQuery, values, logger.tcv2);
  }

  getUserSubscriptions(userId) {
    const sqlQuery = 'SELECT * FROM subscription WHERE user_id = ? ORDER BY date_created';
    return this.execQuery(sqlQuery, [userId], logger.tcv2);
  }

  getSessionSubscription(userId, sessionId) {
    const sqlQuery = 'SELECT * FROM subscription WHERE user_id = ? AND session_id = ?';
    return this.execQuery(sqlQuery, [userId, sessionId], logger.tcv2);
  }
}

const getPort = async () => {
  try {
    const response = await axios.get(process.env.DB_CHECK);
    const data = response.data;
    let port;
    for (let i = 0; i < data.data.length; i++) {
      if (data.data[i].name === process.env.DB_CONTAINER_NAME) {
        port = data.data[i].ports['3306'];
        break;
      }
    }
    return port;
  } catch (error) {
    logger.forms.error(error);
  }
};

const dbHelper = new DbHelper();
module.exports = dbHelper;
