const express = require('express');

const router = express.Router();

const MediaResourceServices = require('../../services/MediaResourceServices');
const bruincastRoute = require('./bruincast');
const videoresRoute = require('./videores');
const musicresRoute = require('./musicres');

router.use('/bruincast', bruincastRoute);
router.use('/videores', videoresRoute);
router.use('/musicres', musicresRoute);

router.get('/counts', (req, res) => {
  const roles = res.locals.token.roles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  if (
    !roles.includes('learner') &&
    !roles.includes('teacher') &&
    !roles.includes('instructor') &&
    !roles.includes('administrator')
  ) {
    return res.status(400);
  }
  const { label } = res.locals.context.context;
  MediaResourceServices.getCounts(label).then(counts => res.send(counts));
});

module.exports = router;
