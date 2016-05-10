var log4js  = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', 
      filename: 'log/logfile.log', 
      category: 'file-logger',
      maxLogSize: 120480,
      backups: 10,
      category: 'file-logger' 
    }
  ]
});

var logger = log4js.getLogger();
var express = require('express');
var app = express();
var passport = require('passport');
//var expressSession = require('express-session');

var ENV   = require('./config.js'); // load configuration data

var mongoose = require('mongoose');
mongoose.connect(ENV.mongodb.MONGODB_URL); // connect to our database


var jwt = require('jsonwebtoken');

// init logging
var logCon  = log4js.getLogger();
// var loggerDB = log4js.getLogger('mongodb');
var logFile = log4js.getLogger('file-logger');
//var logger2Mail = log4js.getLogger('mailer');
logFile.debug('Starting server');
logCon.debug('Starting server');

//logger2Mail.debug('Starting server');

/*
app.use(expressSession({
		  				secret: 'mySecretKey',
  						resave: false,
  						saveUninitialized: true,
			  			cookie: { secure: true }
						}));
*/
app.use(passport.initialize());
//app.use(passport.session());


// Initialize Passport
var initPassport = require('./models/passport/init');
initPassport(passport);


app.use(express.static('client/'));

var loginr = require('./routes/loginr')(passport);
app.use('/api/auth', loginr);


app.get('/test', function (req, res) {
  res.send('Hello World!');
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});