var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


var uuid = require('node-uuid');

//var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cors         = require('cors');
//var session      = require('express-session');
//var passport     = require('passport');
var mongoose     = require('mongoose');
//var MongoClient = require('mongodb').MongoClient;
var mongocli = require('./models/mongocli');
//var mysql        = require('mysql');
//var jwt          = require('jsonwebtoken');
//var expressSession = require('express-session');
// gestione delle sicurezza
var frameguard = require('frameguard');
var helmet = require('helmet');
// var csrf = require('csurf');

/*
app.use(helmet.contentSecurityPolicy({
  // Specify directives as normal.
  directives: {
    defaultSrc: ["'self'", 'd-efault.com','maps.googleapis.com'],
    scriptSrc: ["'self'", 
                //"'unsafe-inline'",
                'maps.googleapis.com',
                ],
    styleSrc: ["'self'",
                //"'unsafe-inline'",
                'fonts.googleapis.com',
                'maps.googleapis.com',
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
*/

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

var dbMysqlPhone = require('./models/mysqlPhone.js');
dbMysqlPhone.connect('info', function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  } else {
    console.log('MySQL Phone connected!');
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


var jsonParser = bodyParser.json({
                              limit:1024*1024*20, 
                              type:'application/json'
                            });
var urlencodedParser = bodyParser.urlencoded({ 
                              extended:true,
                              limit:1024*1024*20,
                              type:'application/x-www-form-urlencoding' 
                            });



app.use(bodyParser.json({
  type: ['json', 'application/csp-report'],
  limit: 1024 //50mb
}));

app.use(bodyParser.urlencoded({ 
  limit:1024, 
  extended: true 
}));


app.use(cookieParser('secretPassword'));
// app.use(csrf({ cookie: true }));
// app.use(function(req, res, next) {
//  res.cookie('XSRF-TOKEN', req.csrfToken());
//  return next();
// });

// error handler
/* CSRF Security
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  console.log('EBADCSRFTOKEN');
  return next(err);
  // res.status(403)
  // res.send('form tampered with')
})
*/

// MongoDb pool create
// Initialize connection once
log.log2console('MongoDb building pool');
var dbMONGO;
mongocli.connect(ENV.mongodb.MONGODB_URL, function(err, database) {
  if(err) {
    res.status(500).json({ error: 'authenticateMONGO : Connection error' });
    return console.dir(err); 
  }
  log.log2console('MongoDb pool builded!');
  dbMONGO = database;
});


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


app.set('socketio', io);


var Sloginr = require('./routes/Sloginr')();
app.use('/auth', Sloginr);

var Smer = require('./routes/Smer')();
app.use('/api/s', Smer);

var Mdata = require('./routes/Mdata')();
app.use('/api/m', Mdata);

var SeqData = require('./routes/Seqr')();
app.use('/api/seq', SeqData);

var BravData = require('./routes/Bravr')();
app.use('/api/brav', BravData);

var Protocollo = require('./routes/Protocollo')();
app.use('/api/protocollo', Protocollo);

var UploadData = require('./routes/Uploadr')();
app.use('/uploadmgr', UploadData);

var Segnalazioni = require('./routes/Segnalazionir')();
app.use('/segnalazioni', Segnalazioni);

var HelpDesk = require('./routes/HelpDeskr')();
app.use('/helpdesk', HelpDesk);

var Phone = require('./routes/Phoner')();
app.use('/phone', Phone);

var Push = require('./routes/Push')();
app.use('/push', Push);

var Socket = require('./routes/Socketr.js');
app.set('socketio', io);
io.sockets.on('connection', Socket);


var Sse = require('./routes/Sse')();
app.use('/sse', Sse);


// SSE -------------------------------------------------------------------------------------------------------------------------
// da mettere nel middleware _ _ _ _ TO DO
//https://github.com/timruffles/event-source-express-angular-real-time-tutorial/blob/master/server/server.js
// create a demo room only
/*
var rooms = require("./models/room.js");
var users = require("./models/userchat.js");
rooms.create("demo");

app.get("/sserooms/:id/chats", fetchRoom, function(req, res) {
  console.log('GET /sserooms', req.params.id);
  res.send(res.locals.room.latest());
});

app.post("/sserooms/:id/chats", fetchRoom, function(req, res) {
  console.log('POST /sserooms', req.params.id);
  console.log(res.locals.room);
  var room = res.locals.room;
  room.chat(req.body);
  res.send(200);
});

// EventSource link :id (Room/SessionId)
app.get("/sserooms/:id/events", fetchRoom, function(req, res) {
  
  
  var room = res.locals.room;
  var sse = startSses(res);

  console.log('GET /sserooms/id/events', room);


  room.on("chat", sendChat);
      
  req.once("end", function() {
    rooms.removeListener("chat", sendChat);
  });
       
  function sendChat(chat) {
    sse("chat", chat);
  }
});

app.get("/sseusers/:id", function(req, res) {
  console.log('GET /sseusers');
  users.get(req.params.id, function(err, user) {
    if(err) {
      return res.send(404);
    }
    console.log(user);
    res.send(user);
  });
});


// POST sseuser crea l'utente e lo ritorna 
app.post("/sseusers", function(req, res) {
  console.log('# POST /sseusers');
  console.log('# creazione utente');
  users.create(function(err, user) {
    if(err) {
      return res.send(500);
    }
    console.log(user);
    res.send(user);
  });
});




function startSses(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write("\n");

  return function sendSse(name,data,id) {
    res.write("event: " + name + "\n");
    if(id) res.write("id: " + id + "\n");
    res.write("data: " + JSON.stringify(data) + "\n\n");
  }
}

// middleware
function fetchRoom(req, res, next) {
  // recuper l'id della chiamata ed imposta la room nelle variabili locali alla richiesta per elaborazione successiva
  console.log('fetchRoom: ', req.params.id );
  var room = rooms.get(req.params.id);
  console.log('fetchRoom: ', room );
  if(room) {
    res.locals.room = room;
    next();
  } else {
    res.status(404).end();
  }
}
*/

// SSE --------------------------------------------------------------------------------------------------------------------------

//io.sockets.on('connection', function(socket){
//    console.log('a user connected');
//    socket.on('disconnect', function(){
//        console.log('user disconnected');
//    });
//  });

// var Ele = require('./routes/Ele')();
// app.use('/ele', Ele);

// var Elezioni = require('./routes/Elezioni')();
// app.use('/elezioni', Elezioni);


//default serving html data
app.use(express.static('ionicclient/www/'));
//app.use(express.static('client/'));
app.use('/cli', express.static(__dirname + '/client'));
app.use('/i2',express.static(__dirname + '/ionic2/www'));
app.use('/poc', express.static(__dirname + '/poc'));
app.use('/swagger', express.static(__dirname + '/swagger'));
app.get('/test', function (req, res) {


console.log('test........xmllib');

    var libxmljs = require("libxmljs");
    var xml =  '<?xml version="1.0" encoding="UTF-8"?>' +
              '<root>' +
                  '<child foo="bar">' +
                      '<grandchild baz="fizbuzz">grandchild content</grandchild>' +
                  '</child>' +
                  '<sibling>with content!</sibling>' +
              '</root>';

    var xmlDoc = libxmljs.parseXml(xml);

    // xpath queries
    var gchild = xmlDoc.get('//*');

    console.log(gchild.text());  // prints "grandchild content"

    var children = xmlDoc.root().childNodes();
    var child = children[0];

    console.log(child.attr('foo').value()); // prints "bar"


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
models.Person.hasMany(models.Blobs);
models.Person.hasMany(models.Nucleos);


server.listen(app.get('port'), function() {
    log.log2console('Express server listening on port ' + server.address().port); 
});

/*

models.sequelize.sync().then(function () {
  log.log2console('Sequelize sync!');
  var server = app.listen(app.get('port'), function() {
    log.log2console('Express server listening on port ' + server.address().port);
  });
});

*/