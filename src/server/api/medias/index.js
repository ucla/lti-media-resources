const express = require('express');

const router = express.Router();

const MediaResourceServices = require('../../services/MediaResourceServices');
const bruincastRoute = require('./bruincast');

router.use('/bruincast', bruincastRoute);

router.get('/counts', (req, res) => {
  const { label } = res.locals.context.context;
  MediaResourceServices.getCounts(label).then(counts => res.send(counts));
});

module.exports = router;
