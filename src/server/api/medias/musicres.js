const express = require('express');

const router = express.Router();

const MusicresServices = require('../../services/MusicresServices');
const CheckRoleServices = require('../../services/CheckRole');

router.get('/', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { label } = res.locals.context.context;
  MusicresServices.getMusicres('201-MSCIND55-1').then(list => res.send(list));
});

module.exports = router;
