const express = require('express');

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

router.post('/playback', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { userid, media, tab, time } = req.body;
  MediaResourceServices.updatePlayback(userid, media, tab, time).then(numDiff =>
    res.send({ numDiff })
  );
});

module.exports = router;
