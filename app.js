var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
  res.render('error');
});

module.exports = app;
