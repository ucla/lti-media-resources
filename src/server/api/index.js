const express = require('express');

const router = express.Router();

const mediasRoute = require('./medias');

router.use('/medias', mediasRoute);

// Names and Roles route.
router.get('/context', (req, res) => {
  const userid = parseInt(res.locals.token.user);
  const roles = res.locals.token.roles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  const { context } = res.locals.context;
  if (roles && context) {
    context.quarter = context.label.substr(0, context.label.indexOf('-'));
    return res.send({
      course: context,
      roles,
      userid,
    });
  }
  return res.status(400).send(new Error('Context not found'));
});

module.exports = router;
