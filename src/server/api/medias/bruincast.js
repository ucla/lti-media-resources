const express = require('express');

const BruincastServices = require('../../services/BruincastServices');
const CheckRoleServices = require('../../services/CheckRole');

const router = express.Router();

/**
 * /notice:
 *   get:
 *     summary: Get bruincast notice
 *     responses:
 *       200:
 *         description: Successfully retrieved bruincast notice
 *         schema:
 *           type: string
 *   post:
 *     summary: Update bruincast notice
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Successfully updated bruincast notice
 */
router.get('/notice', (req, res) => {
  BruincastServices.getNotice().then((notice) => res.send(notice));
});

router.post('/notice', (req, res) => {
  const { notice } = req.body;
  BruincastServices.setNotice(notice).then((ret) => res.send(ret));
});

/**
 * /crosslists:
 *   get:
 *     summary: Get all crosslists
 *     responses:
 *       200:
 *         description: Successfully retrieved crosslists
 *         schema:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: array
 *   post:
 *     summary: Update crosslists
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: array
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Successfully updated crosslists
 */
router.get('/crosslists', (req, res) => {
  BruincastServices.getAllCrosslists().then((list) => res.send(list));
});

router.post('/crosslists', (req, res) => {
  BruincastServices.updateCrosslists(req.body.crosslists).then((numDiff) =>
    res.send(numDiff)
  );
});

/**
 * /casts:
 *   get:
 *     summary: Get all bruincasts of current course
 *     responses:
 *       200:
 *         description: Successfully retrieved bruincasts
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               course:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                   quarter:
 *                     type: string
 *               casts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: number
 *                     listings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           video:
 *                             type: string
 *                           audio:
 *                             type: string
 *                           date:
 *                             type: string
 *                           comments:
 *                             type: string
 *       403:
 *         description: Request rejected by user's role; access restriction
 */
router.get('/casts', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { context } = res.locals.context;
  context.quarter = context.label.substr(0, context.label.indexOf('-'));
  BruincastServices.getCasts(
    context,
    parseInt(res.locals.token.user)
  ).then((casts) => res.send(casts));
});

/**
 * /alllistings:
 *   get:
 *     summary: Get all Bruincast listings, categorized by course shortname
 *     responses:
 *       200:
 *         description: Successfully retrieved and formatted listings
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: object
 *                 properties:
 *                   shortname:
 *                     type: string
 *                   term:
 *                     type: string
 *               subjectArea:
 *                 type: string
 *               listings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     classShortname:
 *                       type: string
 *                     subjectArea:
 *                       type: string
 *                     srs:
 *                       type: string
 *                     term:
 *                       type: string
 *                     date:
 *                       type: string
 *                     week:
 *                       type: int
 *                     video:
 *                       type: string
 *                     audio:
 *                       type: string
 *                     title:
 *                       type: string
 *                     comments:
 *                       type: string
 *                     type:
 *                       type: string
 *                     filename:
 *                       type: string
 *       403:
 *         description: Request rejected because user's role; forbidden.
 */
router.get('/alllistings', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  BruincastServices.getCastListings().then((casts) => res.send(casts));
});

/**
 * /subjectareas:
 *   get:
 *     summary: Get all subject areas of a specific term from bruincast collection
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
  const { term } = req.query;
  BruincastServices.getSubjectAreasForTerm(term).then((subjAreas) =>
    res.send(subjAreas)
  );
});

module.exports = router;
