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

/**
 * /counts:
 *   get:
 *     summary: Get the number of media for each media type
 *     responses:
 *       200:
 *         description: Successfully counted the number of medias
 *         schema:
 *           type: object
 *           properties:
 *             bruincasts:
 *               type: number
 *             videos:
 *               type: number
 *             audios:
 *               type: number
 */
router.get('/counts', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { label } = res.locals.context.context;
  MediaResourceServices.getCounts(label).then(counts => res.send(counts));
});

/**
 * /playback:
 *   post:
 *     summary: Update a playback in database
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: number
 *               file:
 *                 type: string
 *               mediaType:
 *                 type: number
 *               classShortname:
 *                 type: string
 *               time:
 *                 type: number
 *               remaining:
 *                 type: number
 *               finished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated playback
 *       403:
 *         description: Request rejected by user's role; access restriction
 */
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

/**
 * /analytics:
 *   get:
 *     summary: Get all analytics of a specific media type
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaType:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully retrieved analytics (schema depends on media type)
 *       400:
 *         description: Unknown media type
 *       403:
 *         description: Request rejected by user's role; access restriction
 */
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

/**
 * /terms:
 *   get:
 *     summary: Get all terms that a specific media type's collection has
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaType:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully retrieved terms
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       403:
 *         description: Request rejected by user's role; access restriction
 */
router.get('/terms', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { mediaType } = req.query;
  MediaResourceServices.getTerms(mediaType).then(terms => res.send(terms));
});

/**
 * /subjectareas:
 *   get:
 *     summary: Get all subject areas of a specific term that a specific media type's collection has
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaType:
 *                 type: number
 *               term:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved subject areas
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       403:
 *         description: Request rejected by user's role; access restriction
 */
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

/**
 * /url:
 *   get:
 *     summary: Generate URL of media contents
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaType:
 *                 type: number
 *               mediaformat:
 *                 type: string
 *               filename:
 *                 type: string
 *               quarter:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully generated URL
 *         schema:
 *           type: string
 *       400:
 *         description: Unrecognizable parameter value(s)
 *       403:
 *         description: Request rejected by user's role; access restriction
 *       500:
 *         description: Missing parameter(s)
 */
router.get('/url', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }

  const { mediatype, mediaformat, filename, quarter } = req.query;
  const {
    BRUINCAST_HOST,
    VALIDITY,
    SECRET_BRUINCAST_TOKEN,
    VIDEORES_HOST,
    SECRET_VIDEORES_TOKEN,
  } = process.env;

  // When testing during development, replace with your external IP
  const clientIP = req.ip;
  // eslint-disable-next-line no-console
  console.log(req.ip);

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

    host = BRUINCAST_HOST;
    secret = SECRET_BRUINCAST_TOKEN;
  } else if (parseInt(mediatype) === constants.MEDIA_TYPE.VIDEO_RESERVES) {
    stream = `${ext}:${filename}/playlist.m3u8`;

    host = VIDEORES_HOST;
    secret = SECRET_VIDEORES_TOKEN;
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
