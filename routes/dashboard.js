const express = require('express');
const router = express.Router();
var oidc = require('@okta/oidc-middleware');

module.exports = function (_oidc){
  oidc = _oidc;

router.get('/', oidc.ensureAuthenticated(), function(req, res, next) {
  let user;
  if(req.userContext){
    user = req.userContext.userinfo.given_name
  }
  res.render('dashboard', { title: 'Things',user: user});
});

  return router;
}

