
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

//var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cors         = require('cors');
//var session      = require('express-session');
//var passport     = require('passport');
var mongoose     = require('mongoose');
//var jwt          = require('jsonwebtoken');
//var expressSession = require('express-session');

var ENV   = require('./config.js'); // load configuration data

mongoose.connect(ENV.mongodb.MONGODB_URL); // connect to our database



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

// set up our express application

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/*
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(session({ secret: ENV.secret,
                  resave: false,
                  saveUninitialized: true,
                  cookie: { secure: true }
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages sto

// Initialize Passport
var initPassport = require('./models/passport/init');
initPassport(passport);
var loginr = require('./routes/loginr')(passport);
app.use('/api/auth', loginr);
*/

var Sloginr = require('./routes/Sloginr')();
app.use('/auth', Sloginr);

var Smer = require('./routes/Smer')();
app.use('/api', Smer);

app.use(express.static('client/'));

app.get('/test', function (req, res) {
  res.send('Hello World!');
});



app.listen(9988, function () {
  console.log('Listening on port 9988');
});