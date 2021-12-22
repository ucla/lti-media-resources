const express = require('express');

const router = express.Router();

const VideoresServices = require('../../services/VideoresServices');
const CheckRoleServices = require('../../services/CheckRole');

/**
 * /:
 *   get:
 *     summary: Get all video reserves of current course
 *     responses:
 *       200:
 *         description: Successfully retrieved video reserves
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               startDate:
 *                 type: string
 *               stopDate:
 *                 type: string
 *               instructor:
 *                 type: string
 *               videoTitle:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               filename:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               height:
 *                 type: string
 *               width:
 *                 type: string
 *       403:
 *         description: Request rejected by user's role; access restriction
 */
router.get('/', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.context.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const courseSISID = res.locals.context.lis.course_offering_sourcedid;
  VideoresServices.getVideores(
    courseSISID,
    parseInt(res.locals.token.user)
  ).then((list) => res.send(list));
});

/**
 * /alllistings:
 *   get:
 *     summary: Get all Video Reserves listings, categorized by course shortname
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
 *                     term:
 *                       type: string
 *                     srs:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                     stopDate:
 *                       type: string
 *                     title:
 *                       type: string
 *                     instructor:
 *                       type: string
 *                     videoTitle:
 *                       type: string
 *                     videoUrl:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     subtitle:
 *                       type: string
 *                     height:
 *                       type: string
 *                     width:
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
  VideoresServices.getAllVideoReserves().then((vidRes) => res.send(vidRes));
});

module.exports = router;
