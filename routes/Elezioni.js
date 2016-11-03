// Route for Elezioni


var express = require('express');
var router = express.Router();
// var request = require('request');
var os = require('os');
var fs = require('fs');
var path = require('path');
var util = require('util');
var soap = require('soap');
var request = require('request');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var ENV_ELEZIONI   = require('../configELEZIONI.js'); // load user configuration data
var mongocli = require('../models/mongocli');
var async = require('async');
// var Segnalazione  = require('../models/segnalazione.js'); // load configuration data
// var flow = require('../models/flow-node.js')('tmp'); // load configuration data
var utilityModule  = require('../models/utilityModule.js');
var handlebars = require('handlebars');
var xml2js = require('xml2js');
var parser = new xml2js.Parser(); 
var uuid = require('uuid');

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
      filename: 'log/error-' + ENV_ELEZIONI.log_filename, 
      category: 'error-file-logger',
      maxLogSize: 120480,
      backups: 10 
    },
    { type: 'file', 
      filename: 'log/access-' + ENV_ELEZIONI.log_filename, 
      category: 'access-file-logger',
      maxLogSize: 120480,
      backups: 10 
    }
  ]
});

var logConsole  = log4js.getLogger(); // info(...) error(....)
var log2fileError = log4js.getLogger('error-file-logger');
log2fileError.setLevel(ENV_ELEZIONI.log_level);

var log2fileAccess = log4js.getLogger('access-file-logger');

logConsole.info('START ELEZIONI');
log2fileAccess.info('START ELEZIONI');


module.exports = function(){

var WS_IRIDE =  "";
var MODO_OPERATIVO = "TEST";

var dataSAMPLE1 = { 
    CodiceComune: '101',
    CodiceProvincia: '101',
    DataElezione: '2016-12-04',
    Password: 'UklNSU5JLnJlZjEyMjAxNg==',
    TipoElezione: '7',
    UserID: 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p' 
};

// dati di test
var dataSAMPLE = {
        UserID : 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p',
        Password: 'UklNSU5JLnJlZjEyMjAxNg==',
        CodiceComune: '140',
        CodiceProvincia: '101',
        TipoElezione : '7',
        DataElezione: '2016-12-04',
        Sezioni: [  {
                        DescrizioneSezione: 'SEZIONE N.1',
                        NumeroPosizione: '1',
                        CodiceTipoSezione: '1'
                    },
                    {
                        DescrizioneSezione: 'SEZIONE N.2',
                        NumeroPosizione: '2',
                        CodiceTipoSezione: '1'
                    },
                    {
                        DescrizioneSezione: 'SEZIONE N.3',
                        NumeroPosizione: '3',
                        CodiceTipoSezione: '1'
                    }
        ],
        // Elettori
        LivelloAcquisizione: 'S',
        CodiceSezione : '999',
        NumeroProgressivoArea : '71010104000999',
        DataOraInizioComunicazione : '2016-10-26T00:00:00',
        CodTipoElettore : '1',
        NumeroMaschi : '111',
        NumeroFemmine : '222',
        NumeroTotale : '333',
        NumeroTotaleMaschi : '111',
        NumeroTotaleFemmine : '222',
        NumeroTotaleElettori : '333',
        NumeroScheda : '1',
        FlagInserimentoDefinitivo : 'true',
        NumeroVotantiMaschi : '111',
        NumeroVotantiFemmine : '222',
        NumeroVotantiTotale : '333',
        FlagRettifica : 'false',
        NumeroSezioniPervenute : '1',
        NumeroSchedeBianche : '0',
        NumeroSchedeNulle : '0',
        NumeroSchedeContestate : '0',
        NumeroVotiSi : '100',
        NumeroVotiNo : '100',
        TotaleNumeroVoti : '200'
}


function sendElastic( data ) {
    console.log('send2Elastic');
    return new Promise(function(resolve, reject) {
        var my_uuid = uuid.v1();
        // "PUT http://10.10.128.79:9200/velox3/velocita/" & uuid & " -d @" & sFTPTempFile"
        // locals.push(sampleData[dataId]);
        url = "http://10.10.128.79:9200/elezioni/referendum/" + my_uuid;

        // console.log('Data 2 Elastic .. url', url);
        // console.log(data);

        var options = {
                // url : url,
                uri: url,
                method: 'PUT',
                proxy: 'http://proxy1.comune.rimini.it:8080',
                json: true,
                body : data
                
        };

        request(options, function (error, response, body) {
            if (error) { 
                console.log('Errore invio richiesta ...');
                    // console.log(error);
                    reject(error);
            } 
            if (!error && response.statusCode == 201) {
                resolve(response);
            } else {
                // console.log('Errore invio richiesta ...', response);
                reject(response);
            }
        });
    });
}

function sendSoap( operationId, endpoint, request, keyFile ) {

    return new Promise(function(resolve, reject) {

    var ws = require('ws.js');
    var fs = require('fs');
    var sec = ws.Security;
    var X509BinarySecurityToken = ws.X509BinarySecurityToken;
    var FileKeyInfo = require('xml-crypto').FileKeyInfo;
    var x509 = new X509BinarySecurityToken( { "key": fs.readFileSync(keyFile).toString()});
    var signature = new ws.Signature(x509);
    signature.addReference("//*[local-name(.)='Body']");
    signature.addReference("//*[local-name(.)='Timestamp']");
    signature.addReference("//*[local-name(.)='BinarySecurityToken']");

    var sec = new ws.Security({}, [ x509, signature ]);
    var handlers =  [ sec , new ws.Http() ];
    var ctx =   { 
                    request: request,
                    url: endpoint,
                    action: operationId,
                    contentType: "text/xml"
                };

    ws.send(handlers, ctx, function(ctx) {
        console.log("status " + ctx.statusCode);
        console.log("messagse " + ctx.response);
        // console.log(ctx.request);
        // return ctx;
        resolve(ctx);
    }); 

    });

}

// Estrare una parte da un JSON
function extractItem(obj, strItemId) {
    var ids = [];
    for (var prop in obj) {
        if (typeof obj[prop] == "object" && obj[prop]) {
            // console.log(prop, strItemId);
            if (prop == strItemId) {
                // console.log('-->', obj[prop]);
                // ids = obj[prop].map(function(elem){  return elem.id;  })
                ids = obj[prop];
            }
            //console.log('concat', obj[prop]);
            ids = ids.concat(extractItem(obj[prop], strItemId));
        }
    }
    return ids;
}

router.get('/test' , function (req, res) {

 var testJSON = {
     "dataDocumento" : "2016-01-01T10:00:00",
    "S:Envelope": {
      "$": {
        "xmlns:S": "http://schemas.xmlsoap.org/soap/envelope/"
      },
      "S:Body": [
        {
          "InfoQuesitiReferendum": [
            {
              "$": {
                "xmlns": "http://it.mininterno.sie/elettorale"
              },
              "Esito": [
                {
                  "CodiceEsito": [
                    "1000"
                  ],
                  "DescrizioneEsito": [
                    "Operazione terminata con successo"
                  ],
                  "MessageToken": [
                    "0B9D27CE-0A4A-46DF-BED3-A816838D80B9"
                  ]
                }
              ],
              "Quesiti": [
                {
                  "Quesito": [
                    {
                      "TipoElezione": [
                        "7"
                      ],
                      "DataElezione": [
                        "2016-12-04"
                      ],
                      "NumeroScheda": [
                        "1"
                      ],
                      "ProgressivoQuesito": [
                        "1"
                      ],
                      "NumeroQuesito": [
                        "1"
                      ],
                      "TipoReferendum": [
                        "C"
                      ],
                      "DescrizioneQuesito": [
                        "PER L'APPROVAZIONE DELLE LEGGE DI RIFORMA COSTITUZIONALE"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
 };


//var jsonFile = require('./file_test.json'); // the above in my local directory
    var jsonFile = testJSON;

    var testJSON2 = {
     "dataDocumento" : "2016-01-01T10:00:00",
     "descrizione": "d2"
    };


    sendElastic(testJSON2).then(function(response){ 
        console.log(response.body) }
    ).catch(function(err) { 
        console.log(err)
        console.log('ERRORE'); 
    } );

    /*
    .then( function(result){
            res.send( result );
    }).error( function(error){
            res.send( error );
    });
    */
    res.send('ok');
    
})

router.get('/async', function (req, res) {
  // Async task (same in all examples in this chapter)
    function async(arg, callback) {
        console.log('Call function ... do something with \''+arg+'\', return 1 sec later');
        setTimeout(function() { callback(arg * 2); }, 500);
    }
// Final task (same in all the examples)
    function final() { 
        console.log('Done', results);
        res.send(results);
    }

    // A simple async series:
    var items = [ 1, 2, 3, 4, 5, 6 ];
    var results = [];
    function series(item) {
    if(item) {
        async( item, function(result) {
        results.push(result);
        return series(items.shift());
        });
    } else {
        return final();
    }
    }
    series(items.shift());
});

router.get('/produzionebatch', function (req, res) {
    console.log('produzionebatch');
   

    var sampleData = [
        {
            action : {
                operationId : 'recuperaInfoQuesiti',
                actionId : 'showXML'
            },
            data : {
                UserID : 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p',
                Password: 'UklNSU5JLnJlZjEyMjAxNg==',
                CodiceComune: '140',
                CodiceProvincia: '101',
                TipoElezione : '7',
                DataElezione: '2016-12-04'            
            }
        }
      , {
            action : {
                operationId : 'recuperaEventiElettorali',
                actionId : 'sendXML'
            },
            data : {
                UserID : 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p',
                Password: 'UklNSU5JLnJlZjEyMjAxNg==',
                CodiceComune: '140',
                CodiceProvincia: '101',
                TipoElezione : '7',
                DataElezione: '2016-12-04'            
            }
        }
      , {
            action : {
                operationId : 'recuperaInfoQuesiti',
                actionId : 'sendXML'
            },
            data : {
                UserID : 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p',
                Password: 'UklNSU5JLnJlZjEyMjAxNg==',
                CodiceComune: '140',
                CodiceProvincia: '101',
                TipoElezione : '7',
                DataElezione: '2016-12-04'            
            }
        }

    ];

    var locals = [];
    
    async.forEachSeries(Object.keys(sampleData), function(dataId, callback) {
            console.log(sampleData[dataId].action.operationId);
            console.log(sampleData[dataId].action.actionId);

            var operationId = sampleData[dataId].action.operationId;
            var actionId = sampleData[dataId].action.actionId;
            var url = "http://10.10.6.63:9988/elezioni/produzione/" + operationId + "/" + actionId;
            console.log(url); 
             
            // locals.push(sampleData[dataId]);
            console.log('Request .....');
            var options = {
                // url: 'http://10.10.6.63:9988/elezioni/test',
                url : url,
                //url: 'http://jsonplaceholder.typicode.com/posts/1',
                method: 'GET',
                proxy: 'http://proxy1.comune.rimini.it:8080',
                qs : sampleData[dataId].data
            };

            setTimeout(

                    function(){

                    request(options, function (error, response, body) {
                        if (error) { 
                            console.log('Errore invio richiesta ...');
                            console.log(error);
                            callback(error);
                        } 
                        if (!error && response.statusCode == 200) {
                            console.log(response.body);
                            
                            if (actionId == "sendXML") {
                                var info = JSON.parse(response.body);
                                console.log(info);
                                parser.parseString(info.response, function (err, result) {
                                        console.dir(result);
                                        var outJSON = {};
                                        var Esito = extractItem(result, "Esito");
                                        outJSON.operationId = operationId;
                                        outJSON.actionId = actionId;
                                        outJSON.url = info.url;
                                        outJSON.action = info.action;
                                        outJSON.statusCode = info.statusCode;
                                        outJSON.response = info.response;
                                        outJSON.CodiceEsito = Esito[0].CodiceEsito[0]; 
                                        outJSON.DescrizioneEsito = Esito[0].DescrizioneEsito[0];
                                        outJSON.dataDocumento = new Date();
                                        locals.push(outJSON);
                                        sendElastic(outJSON);
                                        callback();
                                });
                            } else {
                                var outJSON = {};
                                outJSON.operationId = operationId;
                                outJSON.actionId = actionId;
                                outJSON.url = url;
                                outJSON.action = "showXML";
                                outJSON.statusCode = "200";
                                outJSON.response = response.body;
                                outJSON.CodiceEsito = "1000"; 
                                outJSON.DescrizioneEsito = "showXML Eseguito con successo";
                                outJSON.dataDocumento = new Date();
                                locals.push(outJSON);
                                callback();
                            }
                        } else {
                            console.log(response);
                            callback();
                        }
                    })
                    }, 2000);

             //var action = trafficLightActions[color];
            //Play around with the color and action
    }, function(err) {
        //When done
        if (err) {
            console.log(err);
            res.status(500).send(err); 
        } else {
            res.status(200).send(locals);
        }
        
    });
});


router.get('/produzione/:operationId/:actionId', function (req, res) {

    var xml2js = require('xml2js');
    var parser = new xml2js.Parser();

    var operationId = req.params.operationId;
    var actionId = req.params.actionId;

    logConsole.info('operationId:', operationId);
    logConsole.info('actionId:', actionId);

    var keyFile = ENV_ELEZIONI.infoGeneriche.keyFile_produzione;
    logConsole.info('keyFile:', keyFile);

    // recupera la configurazione
    if (ENV_ELEZIONI[operationId]) {} else {
        res.status(400).send('operationId: '  +  operationId + ' (Url:/produzione/:operationId/:actionId) NON TROVATA in configurazione');
        return;
    }
    
    var wsdl = ENV_ELEZIONI[operationId].wsdl_produzione;
    logConsole.info('wsdl:', wsdl);

    var xmlTagRisposta = ENV_ELEZIONI[operationId].xmlTagRisposta;
    logConsole.info('xmlTagRisposta:', xmlTagRisposta);
    
    // load template
    var templateFileName = ENV_ELEZIONI[operationId].templateFileName;
    logConsole.info('template:', templateFileName);

    var fileContents = '';
    
    try {
        fileContents = fs.readFileSync(templateFileName).toString();
    } catch (err) {
        logConsole.info(err);
        res.status(400).send('templateFileName: '  +  templateFileName + ' NON TROVATA in configurazione');
        return;
    }

    // var data = dataSAMPLE; // dati di esempio
    var data = req.query;


    var template = handlebars.compile(fileContents);
    var xmlBuilded = template(data);

    if (actionId == 'showXML') {
        res.status(200).send(xmlBuilded);
        return;
    }

    if (actionId == 'sendXML') {
        sendSoap(operationId, wsdl, xmlBuilded, keyFile).then(function(result){
            if (result.statusCode == 200) {
                console.log(result.statusCode);
                console.log(result.response);
                res.status(200).send(result);
            } else {
                log2fileError.error(result);
                res.status(500).send('ERRORE GRAVE - VEDERE LOG.');
            }
        });

    }else{
        logConsole.info('actionId: '  +  actionId + ' NON TROVATA  (showXML|sendXML)');
        res.status(400).send('actionId: '  +  actionId + ' NON TROVATA  (showXML|sendXML)');
        return;
    }
});


  return router;
}

