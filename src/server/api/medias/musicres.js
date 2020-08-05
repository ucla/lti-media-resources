const express = require('express');

const router = express.Router();

const MusicresServices = require('../../services/MusicresServices');

router.get('/', (req, res) => {
  const { label } = res.locals.context.context;
  MusicresServices.getMusicres(label).then(list => res.send(list));
});

module.exports = router;
