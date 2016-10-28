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

// --------------------------------------------------------------------------------------------------
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

res.send(request);

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
var contents = fs.readFileSync('./tmp/sezioni-descrizione2.csv').toString();

console.log(contents);

parse(contents, {comment: '#', delimiter: ';' }, function(err, output){
  console.log(output);
  var outputXML = "";
  output.forEach( function(o){

    var tipoSezione = 1;
    if(o[3] == 'H') tipoSezione = 2; 

    var out = "<elet:DatiSezione>" +
              "<elet:DescrizioneSezione>"+ o[1] + "</elet:DescrizioneSezione>" +
              "<elet:NumeroPosizione>" + o[0] + "</elet:NumeroPosizione>" +
              "<elet:CodiceTipoSezione>" + tipoSezione  + "</elet:CodiceTipoSezione>" +
              "</elet:DatiSezione>";

    outputXML = outputXML + out;

      console.log(o);
      console.log(o[0]);
  } );

    res.send(outputXML);

});

});


router.get('/produzione/generaInvioElettori', function (req, res) {

var parse = require('csv-parse');
var fs = require('fs');
var contents = fs.readFileSync('./tmp/sezioni-consistenza.csv').toString();

console.log(contents);


var UserID = 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p';
var Password = 'UklNSU5JLnJlZjEyMjAxNg==';
var TipoElezione = '7';
var DataElezione = '2016-12-04';
var CodiceProvincia = '101';
var CodiceComune = '140';
var DataOraInizioComunicazione = '2016-11-02T00:00:00';
var CodTipoElettore = '1';
var toOutput = "";

console.log(req.query.codiceSezione);




parse(contents, {comment: '#', delimiter: ';' }, function(err, output){
  console.log(output);
  var outputXML = "";
  output.forEach( function(o){

var CodiceSezione = o[0];
var NumeroMaschi = o[1];
var NumeroFemmine = o[2];
var NumeroTotale = o[3];
var NumeroTotaleElettori = o[3];
var NumeroTotaleMaschi = o[1];
var NumeroTotaleFemmine = o[2];
var NumeroProgressivoArea = '7' + CodiceProvincia + '0' + CodiceComune + utilityModule.pad(CodiceSezione, 6);
// 71010140000056

/*
    var tipoSezione = 1;
    if(o[3] == 'H') tipoSezione = 2; 
    var out = "<elet:DatiElettori>" +
              "<elet:DescrizioneSezione>"+ o[1] + "</elet:DescrizioneSezione>" +
              "<elet:NumeroPosizione>" + o[0] + "</elet:NumeroPosizione>" +
              "<elet:CodiceTipoSezione>" + tipoSezione  + "</elet:CodiceTipoSezione>" +
              "</elet:DatiSezione>";
*/
var outh = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:elet="http://it.mininterno.sie/elettorale">' +
   '<soapenv:Header/>' +
   '<soapenv:Body>' +
      '<elet:DatiInvioElettori>' +
         '<elet:Utente>' +
            '<elet:UserID>' + UserID + '</elet:UserID>' +
            '<elet:Password>' + Password  +  '</elet:Password>' +
         '</elet:Utente>' + 
         '<elet:Evento>' +
            '<elet:TipoElezione>' + TipoElezione +  '</elet:TipoElezione>' +
            '<elet:DataElezione>' + DataElezione +  '</elet:DataElezione>' +
         '</elet:Evento>' +
         '<elet:InfoElettori>' +
            '<elet:Elettori>' + 
               '<elet:CodiceProvincia>' + CodiceProvincia + '</elet:CodiceProvincia>' +
               '<elet:CodiceComune>' + CodiceComune + '</elet:CodiceComune>' +
               '<elet:LivelloAcquisizione>S</elet:LivelloAcquisizione>' +
               '<elet:CodiceSezione>' + CodiceSezione + '</elet:CodiceSezione>' +
               '<elet:NumeroProgressivoArea>' + NumeroProgressivoArea +  '</elet:NumeroProgressivoArea>' +
               '<elet:DataOraInizioComunicazione>' + DataOraInizioComunicazione + '</elet:DataOraInizioComunicazione>' +
               '<elet:DatiElettori>' +
                  '<elet:TipoElettoreInviato>' +
                     '<elet:NumeroTotale>' + NumeroTotale +  '</elet:NumeroTotale>' +
                     '<elet:NumeroMaschi>' + NumeroMaschi + '</elet:NumeroMaschi>' +
                     '<elet:NumeroFemmine>' + NumeroFemmine +  '</elet:NumeroFemmine>' +
                     '<elet:CodTipoElettore>' + CodTipoElettore + '</elet:CodTipoElettore>' + 
                  '</elet:TipoElettoreInviato>' +
               '</elet:DatiElettori>' +
               '<elet:NumeroTotaleElettori>' + NumeroTotaleElettori + '</elet:NumeroTotaleElettori>' + 
               '<elet:NumeroTotaleMaschi>' + NumeroTotaleMaschi + '</elet:NumeroTotaleMaschi>' +
               '<elet:NumeroTotaleFemmine>' + NumeroTotaleFemmine + '</elet:NumeroTotaleFemmine>' +
            '</elet:Elettori>' +
         '</elet:InfoElettori>' +
      '</elet:DatiInvioElettori>' +
   '</soapenv:Body>' +
'</soapenv:Envelope>';





    outputXML = outputXML + outh;

      console.log(o);
      console.log(o[0]);


      // WS chiamata



var ws = require('ws.js')
, fs = require('fs')
, sec = ws.Security
, X509BinarySecurityToken = ws.X509BinarySecurityToken
, FileKeyInfo = require('xml-crypto').FileKeyInfo;

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


request = outh;




var ctx =   { request: request
  , url: "https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumElettori/ServiziElettoraliPort"
  , action: "inviaElettoriReferendum"
  , contentType: "text/xml"
}



if (req.query.codiceSezione ==  CodiceSezione ) {

    console.log(request);
    ws.send(handlers, ctx, function(ctx) {
        // log2file.error(ctx.request);
        console.log("---------------------------------------------------------------------------");
        console.log("status " + ctx.statusCode);
        console.log("messagse " + ctx.response);
        console.log(ctx.request);
    });

   toOutput = request;

  }

      // log

  } );

    res.send(toOutput);
    
});

});


// -------------------------------------------------- SEZIONI ------------------------------------------------
// -------------------------------------------------- SEZIONI ------------------------------------------------
// -------------------------------------------------- SEZIONI ------------------------------------------------


router.get('/produzione/generaInviaSezioniReferendum', function (req, res) {

var parse = require('csv-parse');
var fs = require('fs');
var contents = fs.readFileSync('./tmp/sezioni-descrizione2.csv').toString();

console.log(contents);


var UserID = 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p';
var Password = 'UklNSU5JLnJlZjEyMjAxNg==';
var TipoElezione = '7';
var DataElezione = '2016-12-25';
var CodiceProvincia = '101';
var CodiceComune = '140';
var DataOraInizioComunicazione = '2016-11-02T00:00:00';
var CodTipoElettore = '1';
var toOutput = "";

console.log(req.query.codiceSezione);


var outh = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:elet="http://it.mininterno.sie/elettorale">' +
   '<soapenv:Header/>' +
   '<soapenv:Body>' +
      '<elet:DatiInvioSezioni>' +
         '<elet:Utente>' +
            '<elet:UserID>' + UserID + '</elet:UserID>' +
            '<elet:Password>' + Password  +  '</elet:Password>' +
         '</elet:Utente>' + 
         '<elet:Evento>' +
            '<elet:TipoElezione>' + TipoElezione +  '</elet:TipoElezione>' +
            '<elet:DataElezione>' + DataElezione +  '</elet:DataElezione>' +
         '</elet:Evento>' +
         '<elet:InfoSezioni>' + 
         '<elet:DatiComuneSezioni>' + 
               '<elet:CodiceProvincia>' + CodiceProvincia + '</elet:CodiceProvincia>' +
               '<elet:CodiceComune>' + CodiceComune + '</elet:CodiceComune>' +
               '<elet:Sezioni>';

var outf = '</elet:Sezioni>' + 
            '</elet:DatiComuneSezioni>' + 
         '</elet:InfoSezioni>' +
      '</elet:DatiInvioSezioni>' +
   '</soapenv:Body>' +
'</soapenv:Envelope>';               


var outputXML = "";


parse(contents, {comment: '#', delimiter: ';' }, function(err, output){
  console.log(output);
  output.forEach( function(o){

    var tipoSezione = 1;
    if(o[3] == 'H') tipoSezione = 2; 
    var out = "<elet:DatiSezione>" +
              "<elet:DescrizioneSezione>"+ o[1] + " N. " + o[0] +  "</elet:DescrizioneSezione>" +
              "<elet:NumeroPosizione>" + o[0] + "</elet:NumeroPosizione>" +
              "<elet:CodiceTipoSezione>" + tipoSezione  + "</elet:CodiceTipoSezione>" +
              "</elet:DatiSezione>";


     outputXML = outputXML + out;
     console.log(o);   console.log(o[0]);
    
    });
      // WS chiamata



var ws = require('ws.js')
, fs = require('fs')
, sec = ws.Security
, X509BinarySecurityToken = ws.X509BinarySecurityToken
, FileKeyInfo = require('xml-crypto').FileKeyInfo;

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


request = outh + outputXML + outf;


var ctx =   { request: request
  , url: "https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumSezioni/ServiziElettoraliPort"
  , action: "inviaSezioniReferendum"
  , contentType: "text/xml"
}



    console.log(request);

   
    ws.send(handlers, ctx, function(ctx) {
        // log2file.error(ctx.request);
        console.log("---------------------------------------------------------------------------");
        console.log("status " + ctx.statusCode);
        console.log("messagse " + ctx.response);
        console.log("---------------------------------------------------------------------------");

        console.log(ctx.request);
    });

    

   toOutput = request;
   res.send(toOutput);

      // log

  } );

  


});



  return router;
}



/*
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:elet="http://it.mininterno.sie/elettorale">
   <soapenv:Header/>
   <soapenv:Body>
<elet:DatiInvioSezioni>
         <elet:Utente>
            <elet:UserID>cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p</elet:UserID>
            <elet:Password>UklNSU5JLnJlZjEyMjAxNg</elet:Password>
         </elet:Utente>
         <elet:Evento>
            <elet:TipoElezione>7</elet:TipoElezione>
            <elet:DataElezione>2016-12-04</elet:DataElezione>
         </elet:Evento>
         <elet:InfoSezioni>
         <elet:DatiComuneSezioni>
               <elet:CodiceProvincia>101</elet:CodiceProvincia>
               <elet:CodiceComune>140</elet:CodiceComune>
               <elet:Sezioni>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA PANZINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>1</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA PANZINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>2</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA PANZINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>3</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA PANZINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>4</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA PANZINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>5</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA PANZINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>6</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA PANZINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>7</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>PALAZZINA ROMA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>8</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>PALAZZINA ROMA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>9</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>PALAZZINA ROMA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>10</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>PALAZZINA ROMA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>11</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN GIULIANO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>12</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN GIULIANO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>13</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN GIULIANO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>14</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN GIULIANO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>15</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE D. RAGGI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>16</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE D. RAGGI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>17</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE D. RAGGI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>18</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE D. RAGGI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>19</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE D. RAGGI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>20</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>CASA DI CURA VILLA MARIA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>21</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>2</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE DE AMICIS</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>22</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE DE AMICIS</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>23</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE DE AMICIS</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>24</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE XX SETTEMBRE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>25</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE XX SETTEMBRE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>26</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE XX SETTEMBRE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>27</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE XX SETTEMBRE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>28</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE DE AMICIS</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>29</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE DE AMICIS</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>30</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE DE AMICIS</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>31</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE DE AMICIS</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>32</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAGOMAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>33</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAGOMAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>34</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>I.T.C. PER RAGIONIERI R. VALTURIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>35</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>I.T.C. PER RAGIONIERI R. VALTURIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>36</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>I.T.C. PER RAGIONIERI R. VALTURIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>37</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAGOMAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>38</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>I.T.C. PER RAGIONIERI R. VALTURIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>39</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAGOMAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>40</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>I.T.C. PER RAGIONIERI R. VALTURIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>41</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>OSPEDALE CIVILE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>42</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>2</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>OSPEDALE CIVILE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>43</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>2</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE ALBA ADRIATICA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>44</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE ALBA ADRIATICA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>45</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE ALBA ADRIATICA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>46</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE ALBA ADRIATICA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>47</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE ALBA ADRIATICA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>48</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE ALBA ADRIATICA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>49</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>ISTITUTO PER IL TURISMO M. POLO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>50</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE ALBA ADRIATICA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>51</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>ISTITUTO PER IL TURISMO M. POLO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>52</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>ISTITUTO PER IL TURISMO M. POLO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>53</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO NUOVO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>54</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO NUOVO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>55</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO NUOVO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>56</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA DI DUCCIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>57</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO NUOVO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>58</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA DI DUCCIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>59</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA DI DUCCIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>60</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA DI DUCCIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>61</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA DI DUCCIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>62</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA DI DUCCIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>63</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA BERTOLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>64</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE E. TOTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>65</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA BERTOLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>66</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE G. RODARI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>67</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE G. RODARI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>68</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE G. RODARI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>69</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE G. RODARI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>70</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA BERTOLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>71</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA BERTOLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>72</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA MEDIA BERTOLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>73</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CASTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>74</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CASTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>75</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CASTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>76</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CASTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>77</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO I MAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>78</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO I MAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>79</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN SALVATORE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>80</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN SALVATORE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>81</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE GAIOFANA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>82</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE GAIOFANA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>83</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN FORTUNATO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>84</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO I MAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>85</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO I MAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>86</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN FORTUNATO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>87</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE G. RODARI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>88</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN FORTUNATO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>89</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE MONTESSORI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>90</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE MONTESSORI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>91</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE MONTESSORI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>92</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAMBRUSCHINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>93</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>ISTITUTO VALLONI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>94</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE E. TOTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>95</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE E. TOTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>96</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAMBRUSCHINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>97</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAMBRUSCHINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>98</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE MONTESSORI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>99</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE E. TOTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>100</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE LAMBRUSCHINI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>101</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE E. TOTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>102</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE E. TOTI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>103</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE PADULLI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>104</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE MONTE CIECO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>105</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CORPOLO'</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>106</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CORPOLO'</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>107</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE PADULLI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>108</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE PADULLI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>109</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SPADAROLO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>110</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SPADAROLO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>111</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE PADULLI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>112</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SPADAROLO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>113</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CELLE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>114</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CELLE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>115</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CELLE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>116</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE RIVABELLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>117</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE RIVABELLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>118</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE RIVABELLA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>119</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>120</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CELLE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>121</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CASE NUOVE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>122</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SANTA GIUSTINA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>123</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SANTA GIUSTINA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>124</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SANTA GIUSTINA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>125</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE SAN VITO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>126</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE TORRE PEDRERA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>127</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CASE NUOVE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>128</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>129</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>130</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>131</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>132</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>133</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>134</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>135</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE TORRE PEDRERA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>136</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE VILLAGGIO I MAGGIO</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>137</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE TORRE PEDRERA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>138</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE TORRE PEDRERA</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>139</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>140</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE CELLE</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>141</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>142</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                            <elet:DatiSezione>
                                <elet:DescrizioneSezione>SCUOLA ELEMENTARE F. CASADEI</elet:DescrizioneSezione>
                                <elet:NumeroPosizione>143</elet:NumeroPosizione>
                                <elet:CodiceTipoSezione>1</elet:CodiceTipoSezione>
                            </elet:DatiSezione>
                    </elet:Sezioni>
            </elet:DatiComuneSezioni>
         </elet:InfoSezioni>
      </elet:DatiInvioSezioni>
   </soapenv:Body>
</soapenv:Envelope>                            

*/