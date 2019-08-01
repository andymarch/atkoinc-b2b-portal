var express = require('express');
var router = express.Router();
const axios = require('axios');

router.get('/', function(req, res, next) {
  let user;
  if(req.userContext){
    user = req.userContext.userinfo.given_name
  }
  res.render('invite', { title: 'Invite New User',user: user});
});

router.post('/', async (req,res,next) => {
  let user;
  if(req.userContext){
    user = req.userContext.userinfo.given_name
  }
  try {
      await axios.post(process.env.TENANT_URL+'/api/v1/users',
      {
          profile: { 
              firstName: req.body.firstname,
              lastName: req.body.secondname,
              email: req.body.email,
              login: req.body.email
          },
          groupIds: [
              req.params.groupId
          ]
      });
  }
  catch(error) {
    console.log(error);
  }
  res.redirect('/invite/pending',{user: user});
});

router.get('/pending', function(req, res, next) {
  let user;
  if(req.userContext){
    user = req.userContext.userinfo.given_name
  }
  res.render('invitepending', { title: 'Invite Pending', user: user});
});

module.exports = router;
