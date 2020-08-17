const express = require('express');

const router = express.Router();

const VideoresServices = require('../../services/VideoresServices');
const CheckRoleServices = require('../../services/CheckRole');

router.get('/', (req, res) => {
  if (!CheckRoleServices.isUser(res.locals.token.roles)) {
    return res.status(403).send(new Error('Unauthorized role'));
  }
  const { label } = res.locals.context.context;
  VideoresServices.getVideores(
    label,
    parseInt(res.locals.token.user)
  ).then(list => res.send(list));
});

module.exports = router;
