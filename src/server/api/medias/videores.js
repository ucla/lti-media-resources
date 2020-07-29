const express = require('express');

const router = express.Router();

const VideoresServices = require('../../services/VideoresServices');

router.get('/', (req, res) => {
  const { label } = res.locals.context.context;
  VideoresServices.getVideores(label).then(list => res.send(list));
});

module.exports = router;
