const express = require('express');
const router = express.Router();
var oidc = require('@okta/oidc-middleware');

module.exports = function (_oidc){
  oidc = _oidc;

router.get('/', oidc.ensureAuthenticated(), function(req, res, next) {
  res.render('dashboard', { title: 'Things'});
});

  return router;
}

