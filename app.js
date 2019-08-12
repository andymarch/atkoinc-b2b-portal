require('dotenv').config()

//patch the root CA store with the openssl
var rootCas = require('ssl-root-cas/latest').create();
rootCas.addFile('./ssl/Sectigo_RSA_Domain_Validation_Secure_Server_CA.pem')
rootCas.addFile('./ssl/USERTrust_RSA_Certification_Authority.pem')

require('https').globalAgent.options.ca = rootCas;

const createError = require('http-errors');
const express = require('express');
const hbs  = require('express-handlebars')
const session = require('express-session')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios');
const UserModel = require('./models/usermodel')
const { ExpressOIDC } = require('@okta/oidc-middleware');

const PORT = process.env.PORT || 3000;

var app = express();

app.engine('hbs',  hbs( { 
  extname: 'hbs', 
  defaultLayout: 'base', 
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
  helpers: {
    json: function(json){
      return JSON.stringify(json, undefined, '\t');
    },
    jwt: function (token){
        var atob = require('atob');
        if (token != null) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.stringify(JSON.parse(atob(base64)), undefined, '\t');
        } else {
            return "Invalid or empty token was parsed"
        }
    },
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
          case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
              return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
              return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
              return options.inverse(this);
      }
    }
  }
}));
app.set('view engine', 'hbs');
app.use('/public', express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// session support is required to use ExpressOIDC
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false
}));  

const oidc = new ExpressOIDC({
  issuer: process.env.ISSUER,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
  scope: process.env.SCOPES,
  appBaseUrl: process.env.APP_BASE_URL
});
app.use(oidc.router);
app.use(async function (req,res,next){
  if(req.userContext){
    var response = await axios.get(process.env.TENANT_URL+'/api/v1/users/'+req.userContext.userinfo.sub);
    res.locals.user = new UserModel(response.data)
  }
  next();
})


var indexRouter = require('./routes/index')(oidc)
var accountRouter = require('./routes/account')(oidc)
var inviteRouter = require('./routes/invite')(oidc)
var dashboardRouter = require('./routes/dashboard')(oidc)
var usersRouter = require('./routes/users')(oidc)
var logsRouter = require('./routes/logs')(oidc)
var tokenRouter = require('./routes/tokens')(oidc)

app.use('/', indexRouter)
app.use('/account', accountRouter)
app.use('/invite', inviteRouter)
app.use('/dashboard', dashboardRouter)
app.use('/users', usersRouter)
app.use('/logs',logsRouter)
app.use('/tokens',tokenRouter)

axios.defaults.headers.common['Authorization'] = `SSWS  `+process.env.API_TOKEN

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

app.listen(PORT, () => console.log('App started'));
