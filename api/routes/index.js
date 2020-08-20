const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const aws = require('aws-sdk');
const path = require('path');
const S3_BUCKET = process.env.S3_BUCKET;
const dataAnalysis = require('../utils/data-analysis');

aws.config.region = 'eu-west-1';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Test'});
});

// router.get('/data/:eventId', async function(req, res, next) {
//   // dataAnalysis.start(path.join(__dirname, '..', 'data.csv'));
//   const data = await dataAnalysis(req.params.eventId, req.query.from, req.query.to);
//   res.json({data});
// });

router.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  console.log(req.query);
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read',
  };
  console.log('attempting signing');

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
    };
    res.json(returnData);
  });
});

module.exports = router;
