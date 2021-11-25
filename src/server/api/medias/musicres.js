const express = require('express');

const router = express.Router();

const MusicresServices = require('../../services/MusicresServices');
const CheckRoleServices = require('../../services/CheckRole');

/**
 * /:
 *   get:
 *     summary: Get all music reserves of current course
 *     responses:
 *       200:
 *         description: Successfully retrieved music reserves
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               performers:
 *                 type: string
 *               notes:
 *                 type: string
 *               label:
 *                 type: string
 *               labelCatalogNumber:
 *                 type: string
 *               callNumber:
 *                 type: string
 *               embedURL:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     trackTitle:
 *                       type: string
 *                     volume:
 *                       type: string
 *                     disc:
 *                       type: string
 *                     side:
 *                       type: string
 *                     trackNumber:
 *                       type: string
 *                     httpURL:
 *                       type: string
 *                     rtmpURL:
 *                       type: string
 *               workID:
 *                 type: number
 *       403:
 *         description: Request rejected by user's role; access restriction
 */
router.get('/', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { course_offering_sourcedid } = res.locals.context.lis;
  MusicresServices.getMusicres(
    course_offering_sourcedid,
    parseInt(res.locals.token.user)
  ).then((list) => res.send(list));
});

/**
 * /alllistings:
 *   get:
 *     summary: Get all Music Reserves listings, categorized by course shortname
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
 *                     _id:
 *                       type: ObjectId
 *                     isVideo:
 *                       type: boolean
 *                     compaser:
 *                       type: string
 *                     title:
 *                       type: string
 *                     performers:
 *                       type: string
 *                     noteOne:
 *                       type: string
 *                     noteTwo:
 *                       type: string
 *                     label:
 *                       type: string
 *                     labelCatalogNumber:
 *                       type: string
 *                     callNumber:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           trackTitle:
 *                             type: string
 *                           volume:
 *                             type: string
 *                           disc:
 *                             type: string
 *                           side:
 *                             type: string
 *                           trackNumber:
 *                             type: string
 *                           httpURL:
 *                             type: string
 *                           rtmpURL:
 *                             type: string
 *                     workID:
 *                       type: int
 *                     term:
 *                       type: string
 *                     srs:
 *                       type: string
 *                     classShortname:
 *                       type: string
 *                     subjectArea:
 *                       type: string
 *       403:
 *         description: Request rejected because user's role; forbidden.
 */
router.get('/alllistings', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  MusicresServices.getAllMusicReserves().then((vidRes) => res.send(vidRes));
});

module.exports = router;
