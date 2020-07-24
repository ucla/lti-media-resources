const express = require('express');

const router = express.Router();

const MediaResourceServices = require('../../services/MediaResourceServices');
const bruincastRoute = require('./bruincast');

router.use('/bruincast', bruincastRoute);

router.get('/counts', (req, res) => {
  const { crosslist } = req.query;
  MediaResourceServices.getCounts(crosslist).then(counts => res.send(counts));
});

module.exports = router;
