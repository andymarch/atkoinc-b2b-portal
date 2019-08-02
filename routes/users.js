const express = require('express');
const router = express.Router();
var oidc = require('@okta/oidc-middleware');
const axios = require('axios');
const UserModel = require('../models/usermodel')

module.exports = function (_oidc){
    oidc = _oidc;

    router.get('/', oidc.ensureAuthenticated(), async function(req, res, next) {
    try {
        var response = await axios.get(process.env.TENANT_URL+'/api/v1/users?limit=50');
        var userCollection = []
        for(var user in response.data){
            userCollection.push(new UserModel(response.data[user]))
        }
        res.render('users', { title: 'Users',user: req.userContext.userinfo.given_name,users:userCollection});
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
        try {
            var response = await axios.get(process.env.TENANT_URL+'/api/v1/users/'+req.params.id);
            var targetUser = new UserModel(response.data)
            res.render('user', { title: 'Users', user: req.userContext.userinfo.given_name, targetUser:targetUser});
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
                        login: req.body.email
                    }
                });
                res.redirect(req.params.id)
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

