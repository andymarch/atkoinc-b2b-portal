const express = require('express');
const router = express.Router();
const axios = require('axios');
var oidc = require('@okta/oidc-middleware');

module.exports = function (_oidc){
    oidc = _oidc;

  router.get('/', oidc.ensureAuthenticated(), function(req, res, next) {
    res.render("tokens",{userInfo: req.userContext.userinfo, idToken: req.userContext.tokens.id_token, accessToken: req.userContext.tokens.access_token})
  });

  return router;
}
