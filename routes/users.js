const express = require('express');
const router = express.Router();
var oidc = require('@okta/oidc-middleware');
const axios = require('axios');
const UserModel = require('../models/usermodel')

module.exports = function (_oidc){
    oidc = _oidc;

    router.get('/', oidc.ensureAuthenticated(), async function(req, res, next) {
    try {
        var response = await axios.get(process.env.TENANT_URL+'/api/v1/users/'+req.userContext.userinfo.sub);
        var creatingUser = new UserModel(response.data)

        //build search conditionals always including organization
        var search = 'profile.organization eq "'+creatingUser.organization+'"'
        if(req.query.role_app1){
            search = search + ' and profile.role_app1 eq "'+req.query.role_app1+'"'
        }
        if(req.query.role_app2){
            search = search + ' and profile.role_app2 eq "'+req.query.role_app2+'"'
        }

        console.log("Finding users with parameters: "+search)
        var response = await axios.get(process.env.TENANT_URL + 
            '/api/v1/users?search=' + encodeURI(search));
        var userCollection = []
        for(var user in response.data){
            userCollection.push(new UserModel(response.data[user]))  
        }
        res.render('users', { title: 'Users',organization: creatingUser.organization, users:userCollection});
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

    router.get('/:id', oidc.ensureAuthenticated(), async function(req, res, next) {
        let sub = req.params.id;
        if(sub === "me"){
            sub = req.userContext.userinfo.sub
        }
        try {
            var response = await axios.get(process.env.TENANT_URL+'/api/v1/users/'+sub);
            var targetUser = new UserModel(response.data)

            var creatorObj_response = await axios.get(
                process.env.TENANT_URL+'/api/v1/users/' + sub + 
                "/linkedObjects/account_creator")
            if(creatorObj_response.data.length > 0){
                var response = await axios.get(creatorObj_response.data[0]._links.self.href);
                targetUser.setAccountCreator(response.data)
            }

            var ownerObj_response = await axios.get(
                process.env.TENANT_URL+'/api/v1/users/' + sub + 
                "/linkedObjects/account_owner")
            if(ownerObj_response.data.length > 0){
                var response = await axios.get(ownerObj_response.data[0]._links.self.href);
                targetUser.setAccountOwner(response.data)
            }

            res.render('user', { title: 'Users', targetUser:targetUser, self: req.userContext.userinfo.sub});
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

    router.post('/:id', oidc.ensureAuthenticated(), async function(req, res, next) {
            try {
                await axios.post(process.env.TENANT_URL+'/api/v1/users/'+req.params.id,
                {
                    profile: { 
                        firstName: req.body.firstname,
                        lastName: req.body.secondname,
                        organization: req.body.organization,
                        email: req.body.email,
                        login: req.body.email,
                        role_app1: req.body.role_app1,
                        role_app2: req.body.role_app2
                    }
                });
                res.redirect('/users/'+req.params.id)
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

    router.post('/:id/disable', oidc.ensureAuthenticated(), async function(req, res, next) {
        try {
            await axios.post(process.env.TENANT_URL+'/api/v1/users/'+req.params.id+'/lifecycle/suspend');
            res.redirect('/users/'+req.params.id)
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

    router.post('/:id/enable', oidc.ensureAuthenticated(), async function(req, res, next) {
        try {
            await axios.post(process.env.TENANT_URL+'/api/v1/users/'+req.params.id+'/lifecycle/unsuspend');
            res.redirect('/users/'+req.params.id)
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

    router.post('/:id/delete', oidc.ensureAuthenticated(), async function(req, res, next) {
        try {
            await axios.post(process.env.TENANT_URL+'/api/v1/users/'+req.params.id+'/lifecycle/deactivate');
            await axios.delete(process.env.TENANT_URL+'/api/v1/users/'+req.params.id);
            res.redirect('/users/')
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
  return router;
}

