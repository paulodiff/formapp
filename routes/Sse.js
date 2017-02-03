
// SSE EXTENSION
// https://www.terlici.com/2015/12/04/realtime-node-expressjs-with-sse.html
// http://stackoverflow.com/questions/10700444/running-node-express-server-using-iisnode-eventsource-handlers-not-firing

var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var User  = require('../models/user.js'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var clients = {};

// fake middleware
function fetchRoom(req, res, next) {
  // recuper l'id della chiamata ed imposta la room nelle variabili locali alla richiesta per elaborazione successiva
  console.log('MIDDLEWARE fetchRoom: ', req.params.id );
  next();
  // var room = rooms.get(req.params.id);
  // console.log('fetchRoom: ', room );
  /*
  if(room) {
    res.locals.room = room;
    next();
  } else {
    res.status(404).end();
  }
  */
}

module.exports = function(){

    // EventSource link :id (Room/SessionId)
    router.get("/connect/:id/events", fetchRoom, function(req, res) {
      
      var id = req.params.id.toString();
      console.log('>/connect/:id/events', id);
    
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      clients[id] = res;

      req.on('close', function(){
        console.log('connection closing');
        delete clients[id];
      });

    });

    // subscribe to channel
    router.get("/sub/:channel", fetchRoom, function(req, res) {
      var channel = request.params.id.toString();
      console.log('/sub/:channel', channel);
      // verifica autenticazione
      // sottoscrizione al canale
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();      
    });

    router.get("/broadcast", function(req, res) {
      // verifica autenticazione
      
      console.log('>/broadcast');
      //console.log(clients);

      for (var index in clients){
          console.log(index);
          console.log('SEND DATA..................');
          clients[index].write('id: ' + '100' + '\n');
          clients[index].write('data: ' + 'DATI' + '\n\n');
      }

      /*
      clients.forEach(function(element) {
          console.log('SEND DATA..................');
          element.write('id: ' + '100' + '\n');
          element.write('data: ' + 'DATI' + '\n\n');
      });
      */

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();      

    });


    // post to channel
    router.post("/post/:channel", fetchRoom, function(req, res) {
      // verifica autenticazione
      
      var channel = request.body.channel;
      console.log('>/post/:channel', channel);
      console.log(clients);


      clients.forEach(function(element) {
          console.log(element);
          element.write('id: ' + '100' + '\n');
          element.write('data: ' + 'DATI' + '\n\n');
      });

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();      

    });

    // unsubscribe to channel
    router.get("/unsub/:channel", fetchRoom, function(req, res) {
      // verifica autenticazione
      // sottoscrizione al canale
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();      
    });

    router.post('/pub/news', function(req, res){
        console.log('New post');
        // chiude correttamente la richiesta
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end();

        //var id = request.body.id;

        /*
        if(clients[id] != null) {
            console.log('id = ' + id);
            console.log('data = ' + request.body.data);
            clients[id].write('id: ' + request.body.id + '\n');
            clients[id].write('data: ' + request.body.data + '\n\n');
        }
        */
    });

    // test
    router.get("/test", function(req, res) {
      console.log('test');
      // verifica autenticazione
      // sottoscrizione al canale
      res.status(200).send({ok: '100'});
    });


  	return router;
}

/*
module.exports = function (req, res, next) {

   res.sseSetup = function() {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
  }

  res.sseSend = function(data) {
    res.write("data: " + JSON.stringify(data) + "\n\n");
  }

 

  next()
}
*/