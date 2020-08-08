const express = require('express');
const path = require('path');

const router = express.Router();

const VideoresServices = require('../../services/VideoresServices');
const MediaResourceServices = require('../../services/MediaResourceServices');
const CheckRoleServices = require('../../services/CheckRole');

router.get('/', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { label } = res.locals.context.context;
  VideoresServices.getVideores(label).then(list => res.send(list));
});

router.get('/url', (req, res) => {
  const { filename } = req.query;
  const { VIDEORES_HOST, VIDEORES_TOKEN_SECRET, VALIDITY } = process.env;
  const clientIP = req.ip;
  // When testing during development,
  // use the following line and replace with your external ip
  // const clientIP = '172.91.84.123';
  const ext = path.extname(filename).substr(1);
  const stream = `${ext}:${filename}/playlist.m3u8`;
  const now = new Date();
  const start = Math.round(now.getTime() / 1000);
  const end = start + parseInt(VALIDITY);
  MediaResourceServices.generateMediaURL(
    'videores',
    VIDEORES_HOST,
    stream,
    clientIP,
    VIDEORES_TOKEN_SECRET,
    start.toString(),
    end.toString()
  ).then(url => res.send(url));
});

module.exports = router;
