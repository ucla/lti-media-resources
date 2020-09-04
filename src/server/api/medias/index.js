const express = require('express');
const lti = require('ltijs').Provider;
const path = require('path');

const router = express.Router();

const constants = require('../../../../constants');
const MediaResourceServices = require('../../services/MediaResourceServices');
const BruincastServices = require('../../services/BruincastServices');
const MusicresServices = require('../../services/MusicresServices');
const VideoresServices = require('../../services/VideoresServices');
const CheckRoleServices = require('../../services/CheckRole');
const bruincastRoute = require('./bruincast');
const videoresRoute = require('./videores');
const musicresRoute = require('./musicres');

router.use('/bruincast', bruincastRoute);
router.use('/videores', videoresRoute);
router.use('/musicres', musicresRoute);

router.get('/counts', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { label } = res.locals.context.context;
  MediaResourceServices.getCounts(label).then(counts => res.send(counts));
});

router.post('/playback', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const {
    userid,
    file,
    mediaType,
    classShortname,
    time,
    remaining,
    finished,
  } = req.body;
  MediaResourceServices.updatePlayback(
    userid,
    file,
    mediaType,
    classShortname,
    time,
    remaining,
    finished
  ).then(ok => res.send({ ok }));
});

router.get('/analytics', async (req, res) => {
  if (!CheckRoleServices.isInstructorOrAdmin(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { mediaType } = req.query;

  const { members } = await lti.NamesAndRoles.getMembers(res.locals.token, {
    role: 'Learner',
  });
  for (const member of members) {
    delete member.status;
    delete member.lis_person_sourcedid;
    delete member.given_name;
    delete member.family_name;
    delete member.email;
  }
  const { context } = res.locals.context;
  switch (parseInt(mediaType)) {
    case constants.MEDIA_TYPE.BRUINCAST:
      BruincastServices.getAnalytics(context, members).then(analytics =>
        res.send(analytics)
      );
      break;
    case constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES:
      MusicresServices.getAnalytics(context, members).then(analytics =>
        res.send(analytics)
      );
      break;
    case constants.MEDIA_TYPE.VIDEO_RESERVES:
      VideoresServices.getAnalytics(context, members).then(analytics =>
        res.send(analytics)
      );
      break;
    default:
      res.status(400).send(new Error('Unknown media type'));
  }
});

router.get('/terms', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { mediaType } = req.query;
  MediaResourceServices.getTerms(mediaType).then(terms => res.send(terms));
});

router.get('/subjectareas', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { mediaType, term } = req.query;
  MediaResourceServices.getSubjectAreasForTerm(
    mediaType,
    term
  ).then(subjAreas => res.send(subjAreas));
});

router.get('/url', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }

  const { mediatype, mediaformat, filename, quarter } = req.query;
  const {
    HOST,
    VALIDITY,
    SECRET,
    SECRET_VIDEORES_HOST,
    SECRET_VIDEORES_TOKEN_SECRET,
  } = process.env;

  // When testing during development, replace with your external IP
  const clientIP = req.ip;

  let stream = '';
  const ext = path.extname(filename).substr(1);

  let host = '';
  let secret = '';

  if (parseInt(mediatype) === constants.MEDIA_TYPE.BRUINCAST) {
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
  } else if (parseInt(mediatype) === constants.MEDIA_TYPE.VIDEO_RESERVES) {
    stream = `${ext}:${filename}/playlist.m3u8`;

    host = SECRET_VIDEORES_HOST;
    secret = SECRET_VIDEORES_TOKEN_SECRET;
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
