const express = require('express');

const router = express.Router();

const MusicresServices = require('../../services/MusicresServices');

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
  MusicresServices.getMusicres(label).then(list => res.send(list));
});

module.exports = router;
