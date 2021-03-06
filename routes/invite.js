const express = require('express');
const router = express.Router();
const axios = require('axios');
var oidc = require('@okta/oidc-middleware');
const UserModel = require('../models/usermodel')

module.exports = function (_oidc){
  oidc = _oidc;

  router.get('/', oidc.ensureAuthenticated(), async function(req, res, next) {
    let err = req.query.error;

    try {
      var response = await axios.get(process.env.TENANT_URL+'/api/v1/users/'+req.userContext.userinfo.sub);
      var creatingUser = new UserModel(response.data)

      res.render('invite', { title: 'Invite New User', error:err, federated: creatingUser.federated, organization: creatingUser.organization});
    }
    catch(err) {
      console.log(err)
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error', { title: 'Error' });
    }
  });

  router.post('/', oidc.ensureAuthenticated(), async (req,res,next) => {
    try {
        var groups = []
        var response = await axios.get(process.env.TENANT_URL+'/api/v1/users/'+req.userContext.userinfo.sub+"/groups");
        for( var group in response.data) {
            if(response.data[group].profile.name.startsWith("Partner:")){
              groups.push(response.data[group].id)
            }
        }

        var response = await axios.post(process.env.TENANT_URL+'/api/v1/users',
        {
            profile: { 
                firstName: req.body.firstname,
                lastName: req.body.secondname,
                organization: req.body.organization,
                email: req.body.email,
                login: req.body.login,
                account_validated: 'true',
                account_authenticated: 'false',
                account_federated: req.body.federated,
                role_app1: req.body.role_app1,
                role_app2: req.body.role_app2
            },
            groupIds: groups
        });
        var id = response.data.id

        //link the object to its creator
        var response = await axios.put(
          process.env.TENANT_URL + '/api/v1/users/' +
          id + '/linkedObjects/account_creator/' +
          req.userContext.userinfo.sub)
        var response = await axios.put(
            process.env.TENANT_URL + '/api/v1/users/' +
            id + '/linkedObjects/account_owner/' +
            req.userContext.userinfo.sub)


        res.redirect('/invite/status?id=' + encodeURIComponent(id));
    }
    catch(err) {
      if(err.response.data.errorSummary === "Api validation failed: login"){
        var requestedUser = new UserModel()
        requestedUser.firstName = req.body.firstname
        requestedUser.secondName = req.body.secondname
        requestedUser.login = req.body.login
        requestedUser.email = req.body.email
        requestedUser.role_app1 = req.body.role_app1
        requestedUser.role_app2 = req.body.role_app2
        res.render('invite', { title: 'Invite New User', error:"That username is already taken.", federated: req.body.federated, organization: req.body.organization, targetUser: requestedUser});
      }
      else{
        console.log(err)
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error', { title: 'Error' });
      }
      }  
    }  
  );

  router.get('/status', oidc.ensureAuthenticated(), async(req, res, next) => {
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
    res.render('invitestatus', { title: "Invite Status", invite: response.data, inviteStatus: inviteStatus});
  });
  return router;
}
