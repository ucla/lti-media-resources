const express = require('express');
const path = require('path');

const router = express.Router();

const MediaResourceServices = require('../../services/MediaResourceServices');
const CheckRoleServices = require('../../services/CheckRole');
const bruincastRoute = require('./bruincast');
const videoresRoute = require('./videores');
const musicresRoute = require('./musicres');

router.use('/bruincast', bruincastRoute);
router.use('/videores', videoresRoute);
router.use('/musicres', musicresRoute);

router.get('/counts', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { label } = res.locals.context.context;
  MediaResourceServices.getCounts(label).then(counts => res.send(counts));
});

router.get('/url', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }

  const { mediatype, mediaformat, filename, quarter } = req.query;
  const {
    HOST,
    VALIDITY,
    SECRET,
    VIDEORES_HOST,
    VIDEORES_TOKEN_SECRET,
  } = process.env;

  // When testing during development, use the following line and replace with your external ip
  // const clientIP = '172.91.84.123';
  // const clientIP = '128.97.255.62';
  const clientIP = req.ip;

  let stream = '';
  const ext = path.extname(filename).substr(1);

  let host = '';
  let secret = '';

  if (mediatype === 'bruincast') {
    if (!quarter || !mediaformat || !filename) {
      return res.status(500);
    }

    if (/^[0-9]{2,3}(f|w|s|a|c)$/i.test(quarter)) {
      const yearqt = quarter.substr(0, 3).toLowerCase();
      stream = `20${yearqt}-${mediaformat}/${ext}:${filename}`;
    } else {
      return res.status(400).send(new Error('Incorrect format for quarter'));
    }

    host = HOST;
    secret = SECRET;
  } else if (mediatype === 'videores') {
    stream = `${ext}:${filename}/playlist.m3u8`;

    host = VIDEORES_HOST;
    secret = VIDEORES_TOKEN_SECRET;
  } else {
    return res.status(400).send(new Error('Invalid mediatype'));
  }

  const now = new Date();
  const start = Math.round(now.getTime() / 1000);
  const end = start + parseInt(VALIDITY);

  MediaResourceServices.generateMediaURL(
    mediatype,
    host,
    stream,
    clientIP,
    secret,
    start.toString(),
    end.toString()
  ).then(url => res.send(url));
});

module.exports = router;
