const express = require('express');
const lti = require('ltijs').Provider;

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

router.get('/analytics', async (req, res) => {
  if (!CheckRoleServices.isInstructorOrAdmin(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  let { members } = await lti.NamesAndRoles.getMembers(res.locals.token);
  members = members.filter(member => member.roles.includes('Learner'));
  for (const member of members) {
    delete member.status;
    delete member.lis_person_sourcedid;
    delete member.given_name;
    delete member.family_name;
    delete member.email;
  }
  const { context } = res.locals.context;
  MusicresServices.getAnalytics(context, members).then(analytics =>
    res.send(analytics)
  );
});

module.exports = router;
