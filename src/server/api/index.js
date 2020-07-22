const express = require('express');

const router = express.Router();

const mediasRoute = require('./medias');

router.use('/medias', mediasRoute);

// Names and Roles route.
router.get('/roles', (req, res) => {
  const result = res.locals.token.roles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  return res.send(result);
});

router.get('/course', (req, res) => {
  const { context } = res.locals.context;
  if (context) {
    context.quarter = context.label.substr(0, context.label.indexOf('-'));
    return res.send(context);
  }
  return res.status(400).send(new Error('Context not found'));
});

module.exports = router;
