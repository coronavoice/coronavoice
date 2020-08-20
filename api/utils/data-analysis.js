/* eslint-disable require-jsdoc */
const moment = require('moment');
const jsonfile = require('jsonfile');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const db = require('./db-helper');
const fs = require('fs');
const { Parser } = require('json2csv');

const gauss = require('gauss');
const Collection = gauss.Collection;

module.exports = (async function(eventId, from, to, period = 7, type = 'stats', all) {
  if (!to) {
    to = moment();
  } else {
    to = moment(to);
  }
  if (!from) {
    from = to.clone().add(-1, 'days');
  } else {
    from = moment(from);
  }
  const commentsCollection = new Collection();
  const statsCollection = new Collection();
  const weekStart = getWeekStart(from, to, type, period);
  const sessions = await db.getSessionIds(eventId);
  if (type == 'stats') {
    statsCollection.append(await db.getFeedbackForStats(eventId, weekStart[0].format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss'), all));
    return processWeeklyStats(statsCollection, weekStart, sessions, period);
  }

  if (type == 'comments') {
    commentsCollection.append(await db.getFeedbackForSentiment(eventId, weekStart[0].format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss'), all));
    return processWeeklyComments(commentsCollection, weekStart, sessions, period);
  }

  if (type == 'sentiment') {
    commentsCollection.append(await db.getFeedbackForSentiment(eventId, weekStart[0].format('YYYY/MM/DD HH:mm:ss'), to.format('YYYY/MM/DD HH:mm:ss'), all));
    return processWeeklySentiment(commentsCollection, weekStart, sessions, period);
  }
  // processWeeklySentiment(commentsCollection, weekStart, sessions);
});

function getWeekStart(from, to, type, period = 7) {
  /* const start = moment(from);
  const end = moment(to);
  const weekStart = [];

  do {
    weekStart.push(start.clone());
  } while (start.add(period, 'days').isBefore(end)); */

  let start = moment(from);
  let weekStart = [];
  if (period <= 40 && type !== 'comments') {
    weekStart = [start.clone().add(-1 * period, 'days'), start.clone()];
  } else {
    weekStart = [start.clone()];
  }

  return weekStart;
}

function processWeeklySentiment(results, weekStart, sessions, period) {
  let index = 1;
  let result = []
  for (w of weekStart) {
    const d = sentimentForWeek(results, sessions, period, w);

    // console.log(d);

    if (typeof d !== 'undefined' && d) {
      result.push({
        week: w,
        data: {...d},
      });
    } else {
      result.push({
        week: w,
        data: {},
      });
    }
    // toFile(`week-${index}-sentiment-score-analysis`, d);
    // toCSVFile(`week-${index}-sentiment-score-analysis`, d);
    index++;
  }
  return result;
}

function processWeeklyComments(results, weekStart, sessions, period) {
  let index = 1;
  let result = []
  for (w of weekStart) {
    const d = commentsForWeek(results, sessions, period, w);

    // console.log(d);

    if (typeof d !== 'undefined' && d) {
      result.push(d);
      // toFile(`week-${index}-comments`, d);
      // toCSVFile(`week-${index}-comments`, d);
    }
    index++;
  }
  return result;
}

function processWeeklyStats(results, weekStart, sessions, period) {
  const output = [];
  for (w of weekStart) {
    const d = statsForWeek(results, sessions, period, w);
    if (typeof d !== 'undefined' && d) {
      output.push({
        week: w,
        data: {...d},
      });
    } else {
      output.push({
        week: w,
        data: {},
      });
    }
  }

  return output;

  /* toFile('weekly', {
    weeks: output,
  });
  toCSVFile(`weekly`, output); */
}

function commentsForWeek(results, sessions, period, fromDate = Date()) {
  const toDate = fromDate.clone().add(period, 'days');
  let dateSets = collectionForWeek(results, fromDate, toDate);


  const output = {};

  if (typeof dateSets !== 'undefined' && dateSets && dateSets.length > 0) {
    dateSets = commentsCollection(dateSets);
    const siteData = splitBySession(sessions, dateSets);

    let c = 0;
    for (s of siteData) {
      if (typeof s[0] !== 'undefined' && s[0] && c !== 0) {
        output[s[0].Name] = s;
      } else if (typeof s[0] !== 'undefined' && s[0] && c === 0) {
        output['All Data'] = s;
      }
      c++;
    }
  }

  return output;
}

function sentimentForWeek(results, sessions, period, fromDate = Date()) {
  const toDate = fromDate.clone().add(period, 'days');
  let dateSets = collectionForWeek(results, fromDate, toDate);


  const output = {};

  if (typeof dateSets !== 'undefined' && dateSets && dateSets.length > 0) {
    dateSets = commentsCollection(dateSets);
    const siteData = splitBySession(sessions, dateSets);

    let c = 0;
    for (s of siteData) {
      const scoreSet = new Collection(s).find({}).map(function(response) {
        return Number(response.Score);
      }).toVector();
      const cSet = new Collection(s).find({}).map(function(response) {
        return Number(response.Comparative);
      }).toVector();

      if (typeof s[0] !== 'undefined' && s[0] && c!==0) {
        output[s[0].Name] = {...sentimentStatsForSet(cSet)/* , relativeMean: meanForSet(cSet) */};
      } else if (typeof s[0] !== 'undefined' && s[0] && c === 0) {
        output['All Data'] = {...sentimentStatsForSet(cSet)/* , relativeMean: meanForSet(cSet) */};
      }
      c++;
    }
    return output;
  }
  return null;
}

function statsForWeek(results, sessions, period, fromDate = moment()) {
  const toDate = fromDate.clone().add(period, 'days');
  const dateSets = collectionForWeek(results, fromDate, toDate);

  const output = {};

  if (typeof dateSets !== 'undefined' && dateSets && dateSets.length > 0) {
    const siteData = splitBySession(sessions, dateSets);
    let c = 0;
    for (s of siteData) {
      const set = new Collection(s).find({}).map(function(response) {
        return Number(response.Rating);
      }).toVector();
      const commentCount = new Collection(s).find({}).map(function(response) {
        return Number(response.HasComment);
      }).toVector().sum();

      if (typeof s[0] !== 'undefined' && s[0] && c!==0) {
        output[s[0].Name] = statsForSet(set);
        output[s[0].Name].comments = commentCount;
      } else if (typeof s[0] !== 'undefined' && s[0] && c === 0) {
        output['All Data'] = statsForSet(set);
        output['All Data'].comments = commentCount;
      }
      c++;
    }
    // console.log(output);
    return output;
  }
  return null;
}

function commentsCollection(collection) {
  return collection.map(function(response) {
    const comment = response.Comment ? JSON.parse(response.Comment).text_feedback : '';
    const result = comment ? sentiment.analyze(comment) : null;
    return {
      SessionId: response.SessionId,
      Name: response.Name,
      Rating: response.Rating,
      Date_Created: new Date(response['Date_Created']),
      Comment: comment,
      Score: result ? result.score : null,
      Comparative: result ? result.comparative : null,
      ConsentType: response.ConsentType,
      FileLocation: response.FileLocation,
      FeedbackType: response.FeedbackType,
    };
  });
}

function collectionForWeek(results, from, to) {
  return results.find(function(result) {
    const d = moment(result['Date_Created']);

    return (from.isSameOrBefore(d) && to.isAfter(d));
  });
}

function statsForSet(set) {
  return {
    distribution: set.distribution(),
    relative_distribution: set.distribution('relative'),
    mean: set.mean(),
    stdev: set.stdev(),
    variance: set.variance(),
    count: set.length,
  };
}

function sentimentStatsForSet(set) {
  return {
    values: set,
    // distribution: set.distribution(),
    // relative_distribution: set.distribution('relative'),
    mean: set.mean(),
    stdev: set.stdev(),
    // variance: set.variance(),
    count: set.length,
  };
}

function meanForSet(set) {
  return set.mean();
}

function splitBySession(sessions, collection) {
  const sessionData = [];
  sessionData.push(collection);
  for (session of sessions) {
    sessionData.push(collection.find({
      SessionId: session.SessionId,
    }));
  }
  return sessionData;
}


function toFile(name, json) {
  jsonfile.writeFile(`reports/${name}.json`, json, function(err) {
    if (err) return console.log(err);
    console.error(err);
  });
}

function toCSVFile(name, json) {
  let jsonArr = [];
  Object.keys(json).forEach((key) => {
    jsonArr = jsonArr.concat(json[key]);
  });
  const parser = new Parser();
  const csv = parser.parse(jsonArr);

  fs.writeFile(`reports/${name}.csv`, csv, (err) => {
    if (err) throw err;
  });
}
