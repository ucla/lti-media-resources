const express = require('express');
const requestIp = require('request-ip');

const router = express.Router();

const mediasRoute = require('./medias');

router.use('/medias', mediasRoute);

const { isOnCampusIP } = require('../services/IPServices');

/**
 * /context:
 *   get:
 *     summary: Get userid, roles, and course
 *     responses:
 *       200:
 *         description: Successfully got userid, roles, and course from ltijs
 *         schema:
 *           type: object
 *           properties:
 *             course:
 *               type: object
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *             userid:
 *               type: number
 *             onCampus:
 *               type: boolean
 *       400:
 *         description: Ltijs internal error
 */
router.get('/context', (req, res) => {
  const userid = parseInt(res.locals.token.user);
  const roles = res.locals.context.roles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  const { context } = res.locals.context;
  if (roles && context) {
    context.quarter = context.label.substr(0, context.label.indexOf('-'));
    const clientIP = requestIp.getClientIp(req);
    const onCampus = isOnCampusIP(clientIP);
    return res.send({
      course: context,
      roles,
      userid,
      onCampus,
    });
  }
  return res.status(400).send(new Error('Context not found'));
});

module.exports = router;
