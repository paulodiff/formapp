// Route for Push notification

// Api di protocollo per BRAV


var express = require('express');
var router = express.Router();
// var request = require('request');
var os = require('os');
var fs = require('fs');
var path = require('path');
var util = require('util');
var soap = require('soap');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var vapidKeys = require('../vapid.js');
// var VAPIDencryption = require('../models/encryption.js');
// var ENV_BRAV   = require('../configBRAV.js'); // load user configuration data
// var mongocli = require('../models/mongocli');
// var Segnalazione  = require('../models/segnalazione.js'); // load configuration data
// var flow = require('../models/flow-node.js')('tmp'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); 

var ACCESS_CONTROLL_ALLOW_ORIGIN = false;
// var DW_PATH = (path.join(__dirname, './storage'));
// var DW_PATH = './storage';
// var DW_PATH = ENV.storagePath;
var _ = require('lodash');
/*
var log4js  = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', 
      filename: 'log/error-' + ENV_BRAV.log_filename, 
      category: 'error-file-logger',
      maxLogSize: 120480,
      backups: 10 
    },
    { type: 'file', 
      filename: 'log/access-' + ENV_BRAV.log_filename, 
      category: 'access-file-logger',
      maxLogSize: 120480,
      backups: 10 
    }
  ]
});
var logger = log4js.getLogger();
// init logging
var logCon  = log4js.getLogger();
// var loggerDB = log4js.getLogger('mongodb');

var log2file = log4js.getLogger('error-file-logger');
log2file.setLevel(ENV_BRAV.log_level);

var log2fileAccess = log4js.getLogger('access-file-logger');
*/

module.exports = function(){

// var WS_IRIDE =  "";
// var MODO_OPERATIVO = "TEST";

router.get('/ping', function (req, res) {
  res.send('Push route pong!');
});


router.post('/getPublicKey',  function(req, res){
    res.status(200).send(vapidKeys.publicKey);
});


router.get('/test', function(req, res) {
    var VAPIDencryption = require('../models/encryption.js');
    var endpoint = "http://lll";
    // VAPIDencryption.EncryptionHelperFactoryWrapper
    var vV = VAPIDencryption.sendPushMessage('a','b');
    /*
    var vapidPromise = VAPIDencryption.EncryptionHelperFactoryWrapper.createVapidAuthHeader(
      vapidKeys.publicKey,
      endpoint,
      'mailto:simple-push-demo@gauntface.co.uk');
    */
    // console.log(vapidPromise);
    console.log(VAPIDencryption.EncTEST());
    res.status(200).send('ok');    
});


router.get('/token', function(req, res) {
    var user = {
        "userCompany": "BRAV S.R.L.",
        "userId": "utente",
        "userEmail": "info@brav.it",
        "userDescription": "Via del Portello 4/B 41058 Vignola (MO)",
        "userPassword": "password"
    };
    res.status(200).send(utilityModule.createJWT(user));

});



  return router;
}
