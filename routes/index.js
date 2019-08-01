var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  let user;
  if(req.userContext){
    user = req.userContext.userinfo.given_name
  }
  res.render('index', { title: 'Partner Management Portal',user: user});
});

module.exports = router;
