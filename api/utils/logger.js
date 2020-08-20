const winston = require('winston');
const {format, transports} = winston;
const {combine, timestamp, json} = format;

const container = new winston.Container();

container.add('tcv2', {
  level: 'info',
  format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      json()
  ),
  transports: [
    new transports.File({
      filename: 'tcv2_failed_queries.log',
    }),
    new transports.File({filename: 'tcv2_error.log', level: 'error'}),
    new transports.Console({level: 'error'}),
  ],
});

container.add('tracking', {
  level: 'info',
  format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      json()
  ),
  transports: [
    new transports.File({
      filename: 'tracking_failed_queries.log',
    }),
    new transports.File({filename: 'tracking_error.log', level: 'error'}),
    new transports.Console({level: 'error', format: format.simple()}),
  ],
});

const logger = {
  tcv2: container.get('tcv2'),
  // tracking: container.get('tracking'),
};

module.exports = logger;
