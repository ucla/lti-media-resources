const express = require('express');
const path = require('path');

const BruincastServices = require('../../services/BruincastServices');

const router = express.Router();

router.get('/notice', (req, res) => {
  BruincastServices.getNotice().then(notice => res.send(notice));
});

router.post('/notice', (req, res) => {
  // Update notice in db here
  res.send('Notice updated!');
});

router.get('/crosslist', (req, res) => {
  const { courseLabel } = req.query;
  // Get a list of all crosslist course labels
  const labelList = [courseLabel, '20S-CS32'];
  // Get course object for each label
  // Code below is just a sample. Replace with db queries.
  const { context } = res.locals.context;
  context.quarter = context.label.substr(0, context.label.indexOf('-'));
  const courseList = [
    context,
    {
      id: 69420,
      label: '20S-CS32',
      quarter: '20S',
      title: 'CS 32',
    },
  ];
  return res.send(courseList);
});

router.get('/casts', (req, res) => {
  const { courseLabel } = req.query;
  BruincastServices.getCasts(courseLabel).then(casts => res.send(casts));
});

router.get('/url', (req, res) => {
  const { quarter, type, src } = req.query;
  if (!quarter || !type || !src) {
    return res.status(500);
  }
  const { HOST, VALIDITY, SECRET } = process.env;
  const clientIP = req.ip;
  // When testing during development,
  // use the following line and replace with your external ip
  // const clientIP = '172.91.84.123';
  let stream = '';
  if (/^[0-9]{2,3}(f|w|s|a|c)$/i.test(quarter)) {
    const yearqt = quarter.substr(0, 3).toLowerCase();
    const ext = path.extname(src).substr(1);
    stream = `20${yearqt}-${type}/${ext}:${src}`;
  } else {
    return res.status(400).send(new Error('Incorrect format for quarter'));
  }
  const now = new Date();
  const start = Math.round(now.getTime() / 1000);
  const end = start + parseInt(VALIDITY);

  BruincastServices.generateMediaURL(
    HOST,
    stream,
    clientIP,
    SECRET,
    start.toString(),
    end.toString()
  ).then(url => res.send(url));
});

module.exports = router;
