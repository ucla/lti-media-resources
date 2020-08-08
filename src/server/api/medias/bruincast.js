const express = require('express');
const path = require('path');

const BruincastServices = require('../../services/BruincastServices');
const MediaResourceServices = require('../../services/MediaResourceServices');
const CheckRoleServices = require('../../services/CheckRole');

const router = express.Router();

router.get('/notice', (req, res) => {
  BruincastServices.getNotice().then(notice => res.send(notice));
});

router.post('/notice', (req, res) => {
  const { notice } = req.body;
  BruincastServices.setNotice(notice).then(ret => res.send(ret));
});

router.get('/crosslists', (req, res) => {
  BruincastServices.getAllCrosslists('crosslists').then(list => res.send(list));
});

router.post('/crosslists', (req, res) => {
  BruincastServices.updateCrosslists(
    req.body.crosslists,
    'crosslists'
  ).then(numDiff => res.send(numDiff));
});

router.post('/crosslists', (req, res) => {
  BruincastServices.updateCrosslists(req.body.crosslists).then(numDiff =>
    res.send(numDiff)
  );
});

router.get('/casts', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { context } = res.locals.context;
  context.quarter = context.label.substr(0, context.label.indexOf('-'));
  BruincastServices.getCasts(context).then(casts => res.send(casts));
});

router.get('/castlistings', (req, res) => {
  const { term } = req.query;
  if (!CheckRoleServices.isAdmin(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  BruincastServices.getCastListings(term).then(casts => res.send(casts));
});

router.get('/url', (req, res) => {
  const { quarter, type, src } = req.query;
  if (!quarter || !type || !src) {
    return res.status(500);
  }
  const { HOST, VALIDITY, SECRET } = process.env;
  // Const clientIP = req.ip;
  // When testing during development,
  // use the following line and replace with your external ip
  const clientIP = '172.91.84.123';
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

  MediaResourceServices.generateMediaURL(
    'bruincast',
    HOST,
    stream,
    clientIP,
    SECRET,
    start.toString(),
    end.toString()
  ).then(url => res.send(url));
});

module.exports = router;
