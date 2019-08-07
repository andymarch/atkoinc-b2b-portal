const express = require('express');
const router = express.Router();
var oidc = require('@okta/oidc-middleware');
const axios = require('axios');
var ApplicationModel = require('../models/applicationmodel')

module.exports = function (_oidc){
  oidc = _oidc;

router.get('/', oidc.ensureAuthenticated(), async function(req, res, next) {
  try {
    //await axios.get(process.env.ORG_URL+'/api/v1/apps?filter=user.id+eq+\"'+req.userContext.userinfo.sub+'\"')
    var response =  await axios.get(process.env.TENANT_URL+'/api/v1/users/'+req.userContext.userinfo.sub+'/appLinks')
        var apps = [];
        for( var entry in response.data) {
                apps.push(new ApplicationModel(response.data[entry].label,response.data[entry].linkUrl))  
        }
  res.render('dashboard', { title: 'Things',applinks: apps});
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

