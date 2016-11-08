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
// var multipart = require('connect-multiparty');
// var multipartMiddleware = multipart();
// var jwt = require('jwt-simple');
var ENV = require('../config.js'); // load configuration data
var ENV_ELEZIONI = require('../configELEZIONI.js'); // load user configuration data
// var mongocli = require('../models/mongocli');
var async = require('async');
// var Segnalazione  = require('../models/segnalazione.js'); // load configuration data
// var flow = require('../models/flow-node.js')('tmp'); // load configuration data
var utilityModule = require('../models/utilityModule.js');
var handlebars = require('handlebars');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var uuid = require('uuid');
var SAMPLE_DATA = require ('../tmp/sampleData');

var ACCESS_CONTROLL_ALLOW_ORIGIN = false;
// var DW_PATH = (path.join(__dirname, './storage'));
// var DW_PATH = './storage';
// var DW_PATH = ENV.storagePath;
var _ = require('lodash');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file',
            filename: 'log/error-' + ENV_ELEZIONI.log_filename,
            category: 'error-file-logger',
            maxLogSize: 120480,
            backups: 10
        },
        {
            type: 'file',
            filename: 'log/access-' + ENV_ELEZIONI.log_filename,
            category: 'access-file-logger',
            maxLogSize: 120480,
            backups: 10
        }
    ]
});

var logConsole = log4js.getLogger(); // info(...) error(....)
var log2fileError = log4js.getLogger('error-file-logger');
log2fileError.setLevel(ENV_ELEZIONI.log_level);

var log2fileAccess = log4js.getLogger('access-file-logger');

logConsole.info('START ELEZIONI');
log2fileAccess.info('START ELEZIONI');


module.exports = function () {

    var WS_IRIDE = "";
    var MODO_OPERATIVO = "TEST";
    
    // invia un documento ad ElasticSearch
    function sendElastic(data) {
        console.log('send2Elastic');
        return new Promise(function (resolve, reject) {
            var my_uuid = uuid.v1();
            // "PUT http://10.10.128.79:9200/velox3/velocita/" & uuid & " -d @" & sFTPTempFile"
            // locals.push(sampleData[dataId]);
            url = ENV_ELEZIONI.elastic_url + my_uuid;
            logConsole.info('Elastic:url',url);

            // console.log(data);

            var options = {
                // url : url,
                uri: url,
                method: 'PUT',
                proxy: ENV_ELEZIONI.proxy_url,
                json: true,
                body: data
            };

            request(options, function (error, response, body) {
                if (error) {
                    logConsole.error('ELASTIC:Errore invio richiesta ...');
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

    // esegue la chiamata Soap
    function sendSoap(operationId, endpoint, request, keyFile) {

        return new Promise(function (resolve, reject) {

            var ws = require('ws.js');
            var fs = require('fs');
            var sec = ws.Security;
            var X509BinarySecurityToken = ws.X509BinarySecurityToken;
            var FileKeyInfo = require('xml-crypto').FileKeyInfo;
            var x509 = new X509BinarySecurityToken({ "key": fs.readFileSync(keyFile).toString() });
            var signature = new ws.Signature(x509);
            signature.addReference("//*[local-name(.)='Body']");
            signature.addReference("//*[local-name(.)='Timestamp']");
            signature.addReference("//*[local-name(.)='BinarySecurityToken']");

            var sec = new ws.Security({}, [x509, signature]);
            var handlers = [sec, new ws.Http()];
            var ctx = {
                request: request,
                url: endpoint,
                action: operationId,
                contentType: "text/xml"
            };

            ws.send(handlers, ctx, function (ctx) {
                logConsole.info("SENDSOAP: status " + ctx.statusCode);

                if (ctx.statusCode != 200) {
                    logConsole.error(ctx);
                }

                // console.log("messagse " + ctx.response);
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

    // route di test
    router.get('/test', function (req, res) {
        
        //var jsonFile = require('./file_test.json'); // the above in my local directory
        var testJSON2 = SAMPLE_DATA.testJSON2;

        sendElastic(testJSON2).then(function (response) {
            console.log(response.body)
        }
        ).catch(function (err) {
            console.log(err)
            console.log('ERRORE');
        });

        res.send('ok');

    })


    router.post('/test', function (req, res) {
        //var jsonFile = require('./file_test.json'); // the above in my local directory
        console.log(req.body);
        res.send('ok');
    })


    router.post('/getConfig', function (req, res) {
        //var jsonFile = require('./file_test.json'); // the above in my local directory
        res.send(ENV_ELEZIONI);
    })


    // route che esegue le azioni in async ed in batch
    router.post('/produzionebatch', function (req, res) {
        logConsole.info('produzionebatch');

        var sampleData = req.body;
        logConsole.info(req);
        // logConsole.info(req.dody);   


        var locals = [];

        async.forEachSeries(Object.keys(sampleData), function (dataId, callback) {
            
            logConsole.info('BATCH:operationId:',sampleData[dataId].action.operationId);
            logConsole.info('BATCH:actionId:',sampleData[dataId].action.actionId);

            var operationId = sampleData[dataId].action.operationId;
            var actionId = sampleData[dataId].action.actionId;
            var url = ENV_ELEZIONI.action_url + operationId + "/" + actionId;

            logConsole.info('BATCH:actionId:',url);

            // locals.push(sampleData[dataId]);
            // console.log('Request .....');
            var options = {
                url: url,
                method: 'GET',
                proxy: ENV_ELEZIONI.proxy_url,
                qs: sampleData[dataId].data
            };

            setTimeout(

                function () {

                    request(options, function (error, response, body) {
                        logConsole.info('BATCH: check response:');
                        if (error) {
                            logConsole.error('BATCH: Errore invio richiesta ...');
                            logConsole.error(error);
                            var outJSON = {};
                            outJSON.operationId = operationId;
                            outJSON.actionId = actionId;
                            outJSON.statusCode = "500";
                            outJSON.response = error;
                            outJSON.datiInput = sampleData[dataId].data;
                            outJSON.dataDocumento = new Date();
                            sendElastic(outJSON); 
                            callback(error);
                        }
                        if (!error && response.statusCode == 200) {

                            logConsole.info('BATCH: response OK : ', actionId);
                            // console.log(response.body);

                            if (actionId == "sendXML") {
                                var info = JSON.parse(response.body);
                                // console.log(info);
                                parser.parseString(info.response, function (err, result) {
                                    // console.dir(result);
                                    var outJSON = {};
                                    var Esito = extractItem(result, "Esito");
                                    var SFault = extractItem(result, "S:Fault");
                                    outJSON.operationId = operationId;
                                    outJSON.actionId = actionId;
                                    outJSON.url = info.url;
                                    outJSON.action = info.action;
                                    outJSON.statusCode = info.statusCode;
                                    outJSON.response = info.response;

                                    // console.log(Esito);
                                    // console.log(SFault);

                                    if(Esito.length > 0) {
                                        outJSON.CodiceEsito = Esito[0].CodiceEsito[0];
                                        outJSON.DescrizioneEsito = Esito[0].DescrizioneEsito[0];
                                    } else {
                                        outJSON.CodiceEsito = SFault[0].faultcode[0];
                                        outJSON.DescrizioneEsito = SFault[0].faultstring[0];
                                    }

                                    outJSON.dataDocumento = new Date();
                                    outJSON.datiInput = sampleData[dataId].data;
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
                                sendElastic(outJSON);
                                callback();
                            }
                        } else {
                            logConsole.error('BATCH: Errore generico');
                            var outJSON = {};
                            outJSON.operationId = operationId;
                            outJSON.actionId = actionId;
                            outJSON.statusCode = "500";
                            outJSON.url = url;
                            outJSON.response = response.body;
                            outJSON.dataDocumento = new Date();
                            outJSON.datiInput = sampleData[dataId].data;
                            locals.push(outJSON);
                            callback();
                        }
                    })
                }, 2000);

            //var action = trafficLightActions[color];
            //Play around with the color and action
        }, function (err) {
            //When done
            if (err) {
                logConsole.error('BATCH:FINAL Errore generico', err);
                res.status(500).send(err);
            } else {
                logConsole.info('BATCH:FINAL OK send locals');
                res.status(200).send(locals);
            }
        });
    });

    // route che esegue la singola operazione
    router.get('/produzione/:operationId/:actionId', function (req, res) {

        logConsole.info('SO:START');

        var xml2js = require('xml2js');
        var parser = new xml2js.Parser();

        var operationId = req.params.operationId;
        var actionId = req.params.actionId;

        logConsole.info('SO:operationId:', operationId);
        logConsole.info('SO:actionId:', actionId);

        var keyFile = ENV_ELEZIONI.keyFile_produzione;
        logConsole.info('SO:keyFile:', keyFile);

        // recupera la configurazione
        if (ENV_ELEZIONI[operationId]) { } else {
            logConsole.error('SO:operationId NON TROVATA');
            res.status(500).send('operationId: ' + operationId + ' (Url:/produzione/:operationId/:actionId) NON TROVATA in configurazione');
            return;
        }

        var wsdl = ENV_ELEZIONI[operationId].wsdl_produzione;
        logConsole.info('SO:wsdl:', wsdl);

        var xmlTagRisposta = ENV_ELEZIONI[operationId].xmlTagRisposta;
        logConsole.info('SO:xmlTagRisposta:', xmlTagRisposta);

        // load template
        var templateFileName = ENV_ELEZIONI[operationId].templateFileName;
        logConsole.info('SO:template:', templateFileName);

        var fileContents = '';

        try {
            fileContents = fs.readFileSync(templateFileName).toString();
        } catch (err) {
            logConsole.error('SO:templateFileName: ' + templateFileName + ' NON TROVATA in configurazione');
            res.status(500).send('SO:templateFileName: ' + templateFileName + ' NON TROVATA in configurazione');
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
            sendSoap(operationId, wsdl, xmlBuilded, keyFile).then(function (result) {
                if (result.statusCode == 200) {
                    logConsole.info('SO:sendXML OK:');
                    logConsole.info('SO:sendXML statusCode:', result.statusCode);
                    // console.log(result.response);
                    res.status(200).send(result);
                } else {
                    log2fileError.error(result);
                    logConsole.error('SO:ERROR:', error);
                    res.status(500).send('ERRORE GRAVE - VEDERE LOG.');
                }
            });

        } else {
            logConsole.error('actionId: ' + actionId + ' NON TROVATA  (showXML|sendXML)');
            res.status(500).send('actionId: ' + actionId + ' NON TROVATA  (showXML|sendXML)');
            return;
        }
    });


    return router;
}

/*

<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
<xsl:template match="/">
{
  CodiceEsito: "<xsl:value-of select="//*[local-name() = 'CodiceEsito']"/>",
  DescrizioneEsito: "<xsl:value-of select="//*[local-name() = 'DescrizioneEsito']"/>",
  MessageToken: "<xsl:value-of select="//*[local-name() = 'MessageToken']"/>"
}
</xsl:template>
</xsl:stylesheet>

*/