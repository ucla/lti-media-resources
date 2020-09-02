const express = require('express');

const router = express.Router();

const MusicresServices = require('../../services/MusicresServices');
const CheckRoleServices = require('../../services/CheckRole');

router.get('/', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { label } = res.locals.context.context;
  MusicresServices.getMusicres(
    label,
    parseInt(res.locals.token.user)
  ).then(list => res.send(list));
});

router.get('/alllistings', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  MusicresServices.getAllMusicReserves().then(vidRes => res.send(vidRes));
});

module.exports = router;
