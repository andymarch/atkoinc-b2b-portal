const express = require('express');
const router = express.Router();
const axios = require('axios');
var oidc = require('@okta/oidc-middleware');

module.exports = function (_oidc){
  oidc = _oidc;

  router.get('/', oidc.ensureAuthenticated(), function(req, res, next) {
    let err = req.query.error;
    let user;
    if(req.userContext){
      user = req.userContext.userinfo.given_name
    }
    res.render('invite', { title: 'Invite New User', user: user, error:err});
  });

  router.post('/', oidc.ensureAuthenticated(), async (req,res,next) => {
    try {
        var response = await axios.post(process.env.TENANT_URL+'/api/v1/users',
        {
            profile: { 
                firstName: req.body.firstname,
                lastName: req.body.secondname,
                organization: req.body.organization,
                email: req.body.email,
                login: req.body.email,
                account_validated: 'false',
                account_authenticated: 'false'
            }
        });
        var id = response.data.id
        res.redirect('/invite/status?id='+encodeURIComponent(id));
    }
    catch(error) {
      console.log(error);
      res.redirect('/?error='+encodeURIComponent("An error occurred"))
    }  
  });

  router.get('/status', oidc.ensureAuthenticated(), async(req, res, next) => {
    let user;
    if(req.userContext){
      user = req.userContext.userinfo.given_name
    }
    var id = req.query.id;
    var response = await axios.get(process.env.TENANT_URL+'/api/v1/users/'+id)
    var inviteStatus;
    if(response.data.profile.account_validated === 'false'){
      inviteStatus = "pending validation"
    } else if(response.data.profile.account_authenticated === 'false'){
      inviteStatus = "pending authentication"
    } else {
      inviteStatus = "complete"
    }
    var status = response.data.status;
    res.render('invitestatus', { title: "Invite Status", user: user, invite: response.data, inviteStatus: inviteStatus});
  });
  return router;
}
