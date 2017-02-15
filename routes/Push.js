// Route for Push notification

// https://web-push-book.gauntface.com/
// https://github.com/web-push-libs/web-push
// https://rossta.net/blog/using-the-web-push-api-with-vapid.html
// https://web-push-codelab.appspot.com/
// https://gauntface.github.io/simple-push-demo/
// 
// Service Worker
// https://github.com/chrisdavidmills/push-api-demo
// http://craig-russell.co.uk/2016/01/29/service-worker-messaging.html#.WKRj_VPhBpg
// chrome://inspect/#service-workers



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
var webpush = require('web-push');
var Datastore = require('nedb');
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

var log4js  = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' }
    //,
    //{ type: 'file', 
    //  filename: 'log/error-' + ENV_BRAV.log_filename, 
    //  category: 'error-file-logger',
    //  maxLogSize: 120480,
    //  backups: 10 
    //}
    //,
    //{ type: 'file', 
    //  filename: 'log/access-' + ENV_BRAV.log_filename, 
    //  category: 'access-file-logger',
    //  maxLogSize: 120480,
    //  backups: 10 
    //}
  ]
});
var logger = log4js.getLogger();
// init logging
var logCon  = log4js.getLogger();
logCon.info('PUSH');
logCon.error('PUSH');
// var loggerDB = log4js.getLogger('mongodb');

//var log2file = log4js.getLogger('error-file-logger');
//log2file.setLevel(ENV_BRAV.log_level);

//var log2fileAccess = log4js.getLogger('access-file-logger');

/**** START web-push-gcm ****/
const gcmServerKey = 'AIzaSyC5itnz9jHmpvQRhq8sJUCFUy2SYUPanGs';
webpush.setGCMAPIKey(gcmServerKey);
/**** END web-push-gcm ****/

/**** START web-push-vapid ****/
/**** START vapid-keys ****/
var vapidKeys = {
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  privateKey: 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls'
};
/**** END vapid-keys ****/

webpush.setVapidDetails(
  'mailto:web-push-book@gauntface.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
/**** END web-push-vapid ****/

const db = new Datastore({
  filename: path.join(__dirname, 'subscription-store.db'),
  autoload: true
});

/**** START save-sub-function ****/
function saveSubscriptionToDatabase(subscription) {
  return new Promise(function(resolve, reject) {
    db.insert(subscription, function(err, newDoc) {
      if (err) {
        reject(err);
        return;
      }

      resolve(newDoc._id);
    });
  });
};
/**** END save-sub-function ****/

function getSubscriptionsFromDatabase() {
  return new Promise(function(resolve, reject) {
    db.find({}, function(err, docs) {
      if (err) {
        reject(err);
        return;
      }

      resolve(docs);
    })
  });
}

function deleteSubscriptionFromDatabase(subscriptionId) {
  return new Promise(function(resolve, reject) {
  db.remove({_id: subscriptionId }, {}, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

/**** START save-sub-api-validate ****/
const isValidSaveRequest = (req, res) => {
  // Check the request body has at least an endpoint.
  if (!req.body || !req.body.endpoint) {
    // Not a valid subscription.
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      error: {
        id: 'no-endpoint',
        message: 'Subscription must have an endpoint.'
      }
    }));
    return false;
  }
  return true;
};
/**** END save-sub-api-validate ****/

module.exports = function(){

// This is the API that receives a push subscription and saves it.
/**** START save-sub-example ****/
/**** START save-sub-api-post ****/
router.post('/save-subscription/', function (req, res) {
/**** END save-sub-api-post ****/
  if (!isValidSaveRequest(req, res)) {
    return;
  }

  /**** START save-sub-api-save-subscription ****/
  return saveSubscriptionToDatabase(req.body)
  .then(function(subscriptionId) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ data: { success: true } }));
  })
  .catch(function(err) {
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      error: {
        id: 'unable-to-save-subscription',
        message: 'The subscription was received but we were unable to save it to our database.'
      }
    }));
  });
  /**** END save-sub-api-save-subscription ****/
});
/**** END save-sub-example ****/

router.post('/get-subscriptions/', function (req, res) {
  // TODO: This should be secured / not available publicly.
  //       this is for demo purposes only.
  logCon.info('PUSH:get-subscriptions');
  return getSubscriptionsFromDatabase()
  .then(function(subscriptions) {
    const reducedSubscriptions = subscriptions.map((subscription) => {
      return {
        id: subscription._id,
        endpoint: subscription.endpoint
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ data: { subscriptions: reducedSubscriptions } }));
  })
  .catch(function(err) {
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      error: {
        id: 'unable-to-get-subscriptions',
        message: 'We were unable to get the subscriptions from our database.'
      }
    }));
  });
});

/**** START trig-push-send-notification ****/
const triggerPushMsg = function(subscription, dataToSend) {
  return webpush.sendNotification(subscription, dataToSend)
  .catch((err) => {
    if (err.statusCode === 410) {
      return deleteSubscriptionFromDatabase(subscription._id);
    } else {
      console.log('Subscription is no longer valid: ', err);
    }
  });
};
/**** END trig-push-send-notification ****/

/**** START trig-push-api-post ****/
router.post('/trigger-push-msg/', function (req, res) {
/**** END trig-push-api-post ****/
  // NOTE: This API endpoint should be secure (i.e. protected with a login
  // check OR not publicly available.)

  

  const dataToSend = JSON.stringify(req.body);

  logCon.info('PUSH:trigger-push-msg', dataToSend);

  /**** START trig-push-send-push ****/
  return getSubscriptionsFromDatabase()
  .then(function(subscriptions) {
    var promiseChain = Promise.resolve();

    for (var i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i];
      promiseChain = promiseChain.then(() => {
        return triggerPushMsg(subscription, dataToSend);
      });
    }

    return promiseChain;
  })
  /**** END trig-push-send-push ****/
  /**** START trig-push-return-response ****/
  .then(() => {
    res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ data: { success: true } }));
  })
  .catch(function(err) {
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      error: {
        id: 'unable-to-send-messages',
        message: `We were unable to send messages to all subscriptions : ` +
          `'${err.message}'`
      }
    }));
  });
  /**** END trig-push-return-response ****/
});



// var WS_IRIDE =  "";
// var MODO_OPERATIVO = "TEST";

router.get('/ping', function (req, res) {
  res.send('Push route pong!');
});


router.post('/getPublicKey',  function(req, res){
    res.status(200).send(vapidKeys.publicKey);
});


router.get('/test', function(req, res) {
    logCon.info('/test');
    var VAPIDencryption = require('../models/encryption.js');
    var endpoint = "http://lll";
    // VAPIDencryption.EncryptionHelperFactoryWrapper
    //var vV = VAPIDencryption.sendPushMessage('a','b');
    /*
    var vapidPromise = VAPIDencryption.EncryptionHelperFactoryWrapper.createVapidAuthHeader(
      vapidKeys.publicKey,
      endpoint,
      'mailto:simple-push-demo@gauntface.co.uk');
    */
    // console.log(vapidPromise);
    //console.log(VAPIDencryption.EncTEST());
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
