// Route for BRAV

// Api di protocollo per BRAV

// Suddivisa in parti: 
// 1. Autenticazione, 
// 2. Controllo JSON, 
// 3. Salvataggio Dati / log
// 4. Chiamata a Web Service per il protocollo
// 5. Risposta


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
var ENV_BRAV   = require('../configBRAV.js'); // load user configuration data
var mongocli = require('../models/mongocli');
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


module.exports = function(){

var WS_IRIDE =  "";
var MODO_OPERATIVO = "TEST";

router.get('/ping', function (req, res) {
  res.send('BRAV route pong!');
});


router.get('/test', function (req, res) {

  var soap = require('soap');
  var url = './tmp/wsdl/ServiziElettoraliBase/ServiziElettoraliPort.wsdl';

  var args = {
                    Utente: {
                        UserID: 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p',
                        Password: 'UklNSU5JLnJlZjEyMjAxNg=='
                    },
                    DataElezione: "2016-12-25"
             };


  soap.createClient(url, function(err, client) {
      if(err){
          console.log(err);
      } else {

        client.recuperaEventiElettorali(args, function(err, result) {
            if (err) {
                console.log(err);
            } else {
              console.log(result);
            }
      
        });
      }
  });
  res.send('BRAV route pong!');
});


router.get('/test2', function (req,res) {

var ws = require('ws.js')
, fs = require('fs')
, sec = ws.Security
, X509BinarySecurityToken = ws.X509BinarySecurityToken
, FileKeyInfo = require('xml-crypto').FileKeyInfo

var x509 = new X509BinarySecurityToken(
  { "key": fs.readFileSync("./tmp/test.pem").toString()})
var signature = new ws.Signature(x509)
signature.addReference("//*[local-name(.)='Body']")
signature.addReference("//*[local-name(.)='Timestamp']")
signature.addReference("//*[local-name(.)='BinarySecurityToken']")

var sec = new ws.Security({}, [ x509, signature ])

var handlers =  [ sec
                , new ws.Http()
                ]


request = "<soapenv:Envelope xmlns:elet='http://it.mininterno.sie/elettorale' xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'>" + 
          "<soapenv:Header />" +
          "<soapenv:Body>" +
            "<elet:ParametriRichiestaEventiElettorali>" + 
            "<elet:Utente>" +
                "<elet:UserID>cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p</elet:UserID>" + 
                "<elet:Password>UklNSU5JLnJlZjEyMjAxNg==</elet:Password>" +
            "</elet:Utente>" + 
                "<elet:DataElezione>2016-12-04</elet:DataElezione>" + 
            "</elet:ParametriRichiestaEventiElettorali>" +
           "</soapenv:Body>" +
           "</soapenv:Envelope>";


var ctx =   { request: request
  , url: "https://elettoralews.preprod.interno.it/ServiziElettoraliWSBase/ServiziElettoraliPort"
  , action: "http://tempuri.org/IService/GetData"
  , contentType: "text/xml"
}

console.log(new Date());

ws.send(handlers, ctx, function(ctx) {
    // log2file.error(ctx.request);
    console.log("status " + ctx.statusCode)
    console.log("messagse " + ctx.response)
    // console.log(ctx.request);


    var dw_fileName = "./tmp/" + utilityModule.getNowFormatted() +  ".xml";
    fs.writeFile(dw_fileName, ctx.request, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

});

res.send('stop!');

});


router.get('/test3', function (req,res) {

var ws = require('ws.js')
, fs = require('fs')
, sec = ws.Security
, X509BinarySecurityToken = ws.X509BinarySecurityToken
, FileKeyInfo = require('xml-crypto').FileKeyInfo

var x509 = new X509BinarySecurityToken(
  { "key": fs.readFileSync("./tmp/test.pem").toString()})
var signature = new ws.Signature(x509)
signature.addReference("//*[local-name(.)='Body']")
signature.addReference("//*[local-name(.)='Timestamp']")
signature.addReference("//*[local-name(.)='BinarySecurityToken']")

var sec = new ws.Security({}, [ x509, signature ])

var handlers =  [ sec
                , new ws.Http()
                ]

/*
request = "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
          "<Header />" +
            "<Body>" +
              "<GetData xmlns='http://tempuri.org/'>" +
                "<value>123</value>" +
              "</GetData>" +
            "</Body>" +
          "</Envelope>"
*/

request = "<soapenv:Envelope xmlns:elet='http://it.mininterno.sie/elettorale' xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'>" + 
          "<soapenv:Header />" +
          "<soapenv:Body>" +
            "<elet:DatiInvioSezioni>" + 
            "<elet:Utente>" +
                "<elet:UserID>cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p</elet:UserID>" + 
                "<elet:Password>UklNSU5JLnJlZjEyMjAxNg==</elet:Password>" +
            "</elet:Utente>" + 
            "<elet:Evento>" +
                "<elet:TipoElezione>7</elet:TipoElezione>" +
                "<elet:DataElezione>2016-12-25</elet:DataElezione>" +
            "</elet:Evento>" +
            "<elet:InfoSezioni>" +
            "<elet:DatiComuneSezioni>" +
               "<elet:CodiceProvincia>101</elet:CodiceProvincia>" +
               "<elet:CodiceComune>140</elet:CodiceComune>" +
               "<elet:Sezioni>" +
                  "<elet:DatiSezione>" +
                     "<elet:DescrizioneSezione>SEZIONE1</elet:DescrizioneSezione>" +
                     "<elet:NumeroPosizione>1</elet:NumeroPosizione>" +
                     // "<elet:NumeroProgressivoArea>71010140000001</elet:NumeroProgressivoArea>" +
                     "<elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>" +
                  "</elet:DatiSezione>" +
                  "<elet:DatiSezione>" +
                     "<elet:DescrizioneSezione>SEZIONE2</elet:DescrizioneSezione>" +
                     "<elet:NumeroPosizione>2</elet:NumeroPosizione>" +
                     // "<elet:NumeroProgressivoArea>71010140000002</elet:NumeroProgressivoArea>" +
                     "<elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>" +
                  "</elet:DatiSezione>" +
                  "<elet:DatiSezione>" +
                     "<elet:DescrizioneSezione>SEZIONE3</elet:DescrizioneSezione>" +
                     "<elet:NumeroPosizione>3</elet:NumeroPosizione>" +
                     // "<elet:NumeroProgressivoArea>71010140000003</elet:NumeroProgressivoArea>" +
                     "<elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>" +
                  "</elet:DatiSezione>" +
              "</elet:Sezioni>" +
            "</elet:DatiComuneSezioni>" +
          "</elet:InfoSezioni>" +
          "</elet:DatiInvioSezioni>" +
          "</soapenv:Body>" +
          "</soapenv:Envelope>";


var ctx =   { request: request
  , url: "https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumSezioni/ServiziElettoraliPort"
  , action: "http://tempuri.org/IService/GetData"
  , contentType: "text/xml"
}

console.log(new Date());

ws.send(handlers, ctx, function(ctx) {
    // log2file.error(ctx.request);
    console.log("status " + ctx.statusCode)
    console.log("messagse " + ctx.response)
    // console.log(ctx.request);


    var dw_fileName = "./tmp/" + utilityModule.getNowFormatted() +  ".xml";
    fs.writeFile(dw_fileName, ctx.request, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

});

res.send('stop!');

});

router.get('/test/info', function (req, res) {

var ws = require('ws.js')
, fs = require('fs')
, sec = ws.Security
, X509BinarySecurityToken = ws.X509BinarySecurityToken
, FileKeyInfo = require('xml-crypto').FileKeyInfo

var x509 = new X509BinarySecurityToken(
  { "key": fs.readFileSync("./tmp/test.pem").toString()})
var signature = new ws.Signature(x509)
signature.addReference("//*[local-name(.)='Body']")
signature.addReference("//*[local-name(.)='Timestamp']")
signature.addReference("//*[local-name(.)='BinarySecurityToken']")

var sec = new ws.Security({}, [ x509, signature ])

var handlers =  [ sec
                , new ws.Http()
                ]


request = "<soapenv:Envelope xmlns:elet='http://it.mininterno.sie/elettorale' xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'>" + 
          "<soapenv:Header />" +
          "<soapenv:Body>" +
            "<elet:ParametriRichiesta>" + 
            "<elet:Utente>" +
                "<elet:UserID>cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p</elet:UserID>" + 
                "<elet:Password>UklNSU5JLnJlZjEyMjAxNg==</elet:Password>" +
            "</elet:Utente>" + 
            "<elet:Evento>" +
                "<elet:TipoElezione>7</elet:TipoElezione>" +
                "<elet:DataElezione>2016-12-25</elet:DataElezione>" +
            "</elet:Evento>" +
            "</elet:ParametriRichiesta>" +
           "</soapenv:Body>" +
           "</soapenv:Envelope>";


var ctx =   { request: request
  , url: "https://elettoralews.preprod.interno.it/ServiziElettoraliWSBase/ServiziElettoraliPort"
  , action: "recuperaInfoAreaAcquisizione"
  , contentType: "text/xml"
}

console.log(new Date());

ws.send(handlers, ctx, function(ctx) {
    // log2file.error(ctx.request);
    console.log("status " + ctx.statusCode)
    console.log("messagse " + ctx.response)
    console.log(ctx.request);


    var dw_fileName = "./tmp/" + utilityModule.getNowFormatted() +  ".xml";
    fs.writeFile(dw_fileName, ctx.request, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

});

res.send('stop!');

});

router.get('/produzione/info', function (req, res) {

var ws = require('ws.js')
, fs = require('fs')
, sec = ws.Security
, X509BinarySecurityToken = ws.X509BinarySecurityToken
, FileKeyInfo = require('xml-crypto').FileKeyInfo

var x509 = new X509BinarySecurityToken(
  { "key": fs.readFileSync("./tmp/produzione.pem").toString()})
var signature = new ws.Signature(x509)
signature.addReference("//*[local-name(.)='Body']")
signature.addReference("//*[local-name(.)='Timestamp']")
signature.addReference("//*[local-name(.)='BinarySecurityToken']")

var sec = new ws.Security({}, [ x509, signature ])

var handlers =  [ sec
                , new ws.Http()
                ]


request = "<soapenv:Envelope xmlns:elet='http://it.mininterno.sie/elettorale' xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'>" + 
          "<soapenv:Header />" +
          "<soapenv:Body>" +
            "<elet:ParametriRichiesta>" + 
            "<elet:Utente>" +
                "<elet:UserID>cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p</elet:UserID>" + 
                "<elet:Password>UklNSU5JLnJlZjEyMjAxNg==</elet:Password>" +
            "</elet:Utente>" + 
            "<elet:Evento>" +
                "<elet:TipoElezione>7</elet:TipoElezione>" +
                "<elet:DataElezione>2016-12-04</elet:DataElezione>" +
            "</elet:Evento>" +
            "</elet:ParametriRichiesta>" +
           "</soapenv:Body>" +
           "</soapenv:Envelope>";


var ctx =   { request: request
  , url: "https://elettoralews.interno.it/ServiziElettoraliWSBase/ServiziElettoraliPort"
  , action: "recuperaInfoAreaAcquisizione"
  , contentType: "text/xml"
}

console.log(new Date());

ws.send(handlers, ctx, function(ctx) {
    // log2file.error(ctx.request);
    console.log("status " + ctx.statusCode)
    console.log("messagse " + ctx.response)
    console.log(ctx.request);


    var dw_fileName = "./tmp/" + utilityModule.getNowFormatted() +  ".xml";
    fs.writeFile(dw_fileName, ctx.request, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

});

res.send('stop!');

});

router.get('/test/parse', function (req, res) {

var parse = require('csv-parse');
var fs = require('fs');
var contents = fs.readFileSync('./tmp/sezioni.csv').toString();


parse(contents, {comment: '#', delimiter: ';' }, function(err, output){
  console.log(output);

  output.forEach( function(o){
      console.log(o);
      console.log(o[0]);
  } );

});


});


  return router;
}
