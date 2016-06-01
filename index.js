var express = require('express');
var app = express();
var uuid = require('node-uuid');

//var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cors         = require('cors');
//var session      = require('express-session');
//var passport     = require('passport');
var mongoose     = require('mongoose');
//var mysql        = require('mysql');
//var jwt          = require('jsonwebtoken');
//var expressSession = require('express-session');
// gestione delle sicurezza
var frameguard = require('frameguard');
var helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  // Specify directives as normal.
  directives: {
    defaultSrc: ["'self'", 'd-efault.com'],
    scriptSrc: ["'self'", 
                "'unsafe-inline'",
                "'sha256-1PxuDsPyGK6n+LZsMv0gG4lMX3i3XigG6h0CzPIjwrE='"
                ],
    styleSrc: ["'self'",
                "'sha256-1PxuDsPyGK6n+LZsMv0gG4lMX3i3XigG6h0CzPIjwrE='",
                "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
                "'sha256-PDYg/vkWbGnl+ya8uasRQlyo8wGc+3ANz5x3d3aNWUI='",
                "'sha256-UtUbbZ5pLwzvjGTHwLTsbIxr5p5bX60ndOEI8wF3bo4='",
                "'sha256-QG3Eg3DGi8tPwqt0K2eUwBqB1GNl19PjW/3Ex5i5mPk='",
                "'sha256-j3gGPuXMDPpU+BxRYg+qUVF0TSGtFEKcp1muBBATanE='",
                "'sha256-3RgHoWfZTUIYaaqXpyMi4osn0e3W0oyKtFnPAFo1uvI='",
                "'sha256-n9t4cSjdGHb1Hj8yhaCQy3nxaXjPnaDbPkrwYo97sdI='",
                "'sha256-pSJ3mKkpKCRMub/4VC+QXgZS+y+3+5w9EMRavXs3s38='",

                'fonts.googleapis.com',
                'maxcdn.bootstrapcdn.com',
                'code.ionicframework.com'],
    fontSrc: ["'self'",
            'fonts.gstatic.com',
            'maxcdn.bootstrapcdn.com',
            'code.ionicframework.com'
            ],
    imgSrc: ["'self'", 'img.com', 'data:'],
    childSsrc: ['self'],
    sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-modals'],
    reportUri: '/report-violation',
    objectSrc: [] // An empty array allows nothing through
  },

  // Set to true if you only want browsers to report errors, not block them
  reportOnly: false,

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: false,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true
}));
app.use(helmet.xssFilter({ setOnOldIE: true }));
app.use(frameguard({ action: 'deny' }));
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());


var ENV   = require('./config.js'); // load configuration data

mongoose.connect(ENV.mongodb.MONGODB_URL); // connect to our database

var dbMysql = require('./models/mysqlModule.js');
dbMysql.connect('info', function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  } else {
    console.log('MySQL connected!');
  }
});

var log = require('./models/loggerModule.js');

//var logger2Mail = log4js.getLogger('mailer');
log.log2file('Starting server');
log.log2console('Starting server');




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
app.use(bodyParser.json({
  type: ['json', 'application/csp-report']
}))
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
app.use('/api/s', Smer);

var Mdata = require('./routes/Mdata')();
app.use('/api/m', Mdata);

var SeqData = require('./routes/Seqr')();
app.use('/api/seq', SeqData);


app.use(express.static('client/'));

app.get('/test', function (req, res) {
  res.send('Hello World!');
});


// CSP violation!
app.post('/report-violation', function (req, res) {
  if (req.body) {
    log.log2console('CSP Violation: ', req.body);
  } else {
    log.log2console('CSP Violation: No data received!');
  }
  res.status(204).end();
})



var models = require("./modelsSequelize");

app.set('port', process.env.PORT || 9988);


models.Person.hasMany(models.Tasks);



models.sequelize.sync({force:true}).then(function () {
  log.log2console('Sequelize sync!');
  var server = app.listen(app.get('port'), function() {
    log.log2console('Express server listening on port ' + server.address().port);
  });
});

