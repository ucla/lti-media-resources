const express = require('express');
const lti = require('ltijs').Provider;

const BruincastServices = require('../../services/BruincastServices');
const CheckRoleServices = require('../../services/CheckRole');

const router = express.Router();

router.get('/notice', (req, res) => {
  BruincastServices.getNotice().then(notice => res.send(notice));
});

router.post('/notice', (req, res) => {
  const { notice } = req.body;
  BruincastServices.setNotice(notice).then(ret => res.send(ret));
});

router.get('/crosslists', (req, res) => {
  BruincastServices.getAllCrosslists('crosslists').then(list => res.send(list));
});

router.post('/crosslists', (req, res) => {
  BruincastServices.updateCrosslists(
    req.body.crosslists,
    'crosslists'
  ).then(numDiff => res.send(numDiff));
});

router.post('/crosslists', (req, res) => {
  BruincastServices.updateCrosslists(req.body.crosslists).then(numDiff =>
    res.send(numDiff)
  );
});

router.get('/casts', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { context } = res.locals.context;
  context.quarter = context.label.substr(0, context.label.indexOf('-'));
  BruincastServices.getCasts(
    context,
    parseInt(res.locals.token.user)
  ).then(casts => res.send(casts));
});

router.get('/alllistings', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { term } = req.query;
  BruincastServices.getCastListings(term).then(casts => res.send(casts));
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
  BruincastServices.getAnalytics(
    context,
    members,
    'crosslists',
    'bruincastmedia',
    'playbacks'
  ).then(analytics => res.send(analytics));
});

router.get('/subjectareas', (req, res) => {
  if (!CheckRoleServices.isAdmin(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { term } = req.query;
  BruincastServices.getSubjectAreasForTerm(term).then(subjAreas =>
    res.send(subjAreas)
  );
});

module.exports = router;
