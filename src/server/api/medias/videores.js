const express = require('express');

const router = express.Router();

const VideoresServices = require('../../services/VideoresServices');

router.get('/', (req, res) => {
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
  VideoresServices.getVideores(label).then(list => res.send(list));
});

module.exports = router;
