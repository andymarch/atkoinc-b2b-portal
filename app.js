require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const hbs  = require('express-handlebars')
const session = require('express-session')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios');
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

var indexRouter = require('./routes/index');
var inviteRouter = require('./routes/invite')(oidc);

app.use('/', indexRouter);
app.use('/invite', inviteRouter);

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
