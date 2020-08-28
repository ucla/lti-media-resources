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
  const { term } = req.query;
  MusicresServices.getAllMusicReserves(term).then(vidRes => res.send(vidRes));
});

router.get('/subjectareas', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { term } = req.query;
  MusicresServices.getSubjectAreasForTerm(term).then(subjAreas =>
    res.send(subjAreas)
  );
});

router.get('/terms', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  MusicresServices.getTerms().then(terms => res.send(terms));
});

module.exports = router;
