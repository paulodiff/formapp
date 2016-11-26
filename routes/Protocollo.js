// Route for Protccollo


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
var _ = require('lodash');
// var Segnalazione  = require('../models/segnalazione.js'); // load configuration data
// var flow = require('../models/flow-node.js')('tmp'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); 

var ACCESS_CONTROLL_ALLOW_ORIGIN = false;
// var DW_PATH = (path.join(__dirname, './storage'));
// var DW_PATH = './storage';
// var DW_PATH = ENV.storagePath;

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
  res.send('Protocollo Up!');
});


router.get('/getTestToken', function (req, res) {
    var demoData = {
        companyName: "Comune_di_Rimini",
        app: "protocollo"
    };
    res.send(utilityModule.createJWT(demoData));
});


router.post('/upload', multipartMiddleware, function(req, res) {
  console.log('/uploading.....');
  console.log(req.files);
  console.log('/body.....');
  console.log(req.body);
  
  var transactionId = req.body.fields.transactionId;
  var DW_PATH = './storage/PROTOCOLLO';
  // var dir = DW_PATH + "/" +  transactionId;
  var dir = DW_PATH;
  

  if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

  if(req.files) console.log('1');
  if(req.files.files) console.log('2');
  console.log(req.files.files.length);
  if(req.files.files.length) console.log(req.files.files.length);

  if (req.files && req.files.files && req.files.files.length) {

    console.log('Saving files ...');
    
    for (var i = 0; i < req.files.files.length; i++) {
      
      console.log(req.files.files[i].path);
      console.log(req.files.files[i].originalFilename);
      console.log(req.files.files[i].size);

      fs.renameSync(req.files.files[i].path, dir + "/" + req.files.files[i].originalFilename);

    }
  } else {
      console.log('No files. ...');
  }
  

  res.status(200).send('Operazioni terminate ....');

});


router.post('/inserisciProtocollo',  utilityModule.ensureAuthenticated, function(req, res){

    log2fileAccess.info('# user ---------------');
    log2fileAccess.info(req.user);
    log2fileAccess.info('# body ---------------');
    log2fileAccess.info(req.body);

    // WS_IRIDE = ENV_BRAV.wsiride.url_test;
    WS_IRIDE = ENV_BRAV.wsJiride.url_test;
    log2fileAccess.info(WS_IRIDE);

    /*
    if(req.body.produzione) {
        console.log('[##PRODUZIONE##]');
        WS_IRIDE = ENV_BRAV.wsiride.url_produzione;
        MODO_OPERATIVO = "PRODUZIONE";
    } 
    */

    log2fileAccess.info('MODO_OPERATIVO:', MODO_OPERATIVO);
    log2fileAccess.info('WS_IRIDE:',WS_IRIDE);
    // ## log info ip

    console.log('companyName:', req.user.companyName);

    // recupero dati di protocollazione
    if(req.user.companyName != "Comune_di_Rimini"){
        var msg = 'userCompany NO MATCH'
        console.error(msg);
        log2file.error(msg);
        res.status(401).json({message : msg});
        return;
    } else {
        log2fileAccess.error('non trovo companyName');
    }

    log2fileAccess.info('Log in:');
    log2fileAccess.info(req.user);


    var p7m1 = utilityModule.base64_encode('./test.pdf.p7m');
    var pdf1 = utilityModule.base64_encode('./test.pdf');

    /*
    // ## test Json Validation
    console.log('[*] Validation ...');
    // console.log(req.body);
    
    var Ajv = require('ajv');
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    
    var schema = JSON.parse(fs.readFileSync('./protocolloSchema.json'));
    // var j2validate = JSON.parse(fs.readFileSync('./pacchettoBRAV.json'));
 
    var validate = ajv.compile(schema);
    var valid = validate(req.body);
    // console.log(valid);
    if (!valid) {
        console.error(validate.errors);
        var msg = 'Json validation error';
        console.error(msg);
        log2file.error(msg);
        log2file.error(validate.errors);
        res.status(401).json({message : msg, jsonvalidation : validate.errors});
        return;
    }

    */

    //  ## Chiamata a protocollo ....

    /*
    console.log('// BODY ------------------------------------------------- ');
    console.log(req.body);
    console.log('// RICHIEDENTE ------------------------------------------------- ');
    console.log(req.body.richiedente);
    console.log('// RICHIEDENTE ------------------------------------------------- ');
    console.log(req.body.richiedente.nome);

    var DataProtocollo = "01/01/2000";
    var OggettoDescrizione = "BRAV PERMESSO N. " + req.body.numeroIdentificativoPermesso;
    var IdTipoDocumento = ENV_BRAV.wsiride.tipo_documento;
    var CodiceFiscale = req.body.richiedente.codiceFiscale;
    var CognomeNome = req.body.richiedente.cognome + ' ' + req.body.richiedente.nome;
    var DataDiNascita =  req.body.richiedente.dataDiNascita;
    var Note = "NOTE";
    var base64content = new Buffer(Note).toString('base64');

    */

    var args = { 
           ProtoIn : {
                Data: '30/11/2016',
                Classifica: '001 010 001',
                TipoDocumento: '44032',
                Oggetto: 'Protocollo del ' + new Date(),
                Origine: 'A',
                MittenteInterno: '404',
                //MittenteInterno_Descrizione": "",
                // AnnoPratica: '2016',
                // NumeroPratica: '2016-404-0003',

                 
               MittentiDestinatari: {
                MittenteDestinatario: [
                  {
                    CodiceFiscale : 'RGGRGR70E25H294T',
                    CognomeNome: 'RUGGERI RUGGERO',
                    // DataNascita : DataDiNascita,
                    // Nome : 'RUGGERO',
                    // Spese_NProt : 0,
                    // TipoSogg: 'S',
                    // TipoPersona : 'F'
                  }
                ]
              },
              
              AggiornaAnagrafiche : 'S',
              InCaricoA : '404',
              NumeroDocumento : 1,
              NumeroAllegati : 2,
              Utente : "wsalbo",
              Ruolo : "SETTORE SISTEMA INFORMATIVO",              
              Allegati: {  Allegato: []  }
            }
        };

// build attachements array

    
    
    // allegato principale
    args.ProtoIn.Allegati.Allegato.push(
        {
            TipoFile : 'pdf',
            ContentType : 'application/pdf',
            Image: pdf1,
            NomeAllegato: 'test.pdf',
            Commento : 'Allegato Principale PDF'
        }
    );

    

    // allegati secondari
    console.log(req.body.numeroAllegati);

    if (parseInt(req.body.numeroAllegati) > 0) {
        req.body.allegati.forEach( function(item){

            args.ProtoIn.Allegati.Allegato.push(
                {
                    TipoFile : 'p7m',
                    ContentType : 'application/pkcs7-mime',
                    NomeAllegato: 'test.pdf.p7m',
                    Image: p7m1,
                    Commento :  'Allegato Principale P7m'
                }
            );

        })
    }
    

    // console.log(util.inspect(args));
    // console.log(util.inspect(args.ProtoIn.MittentiDestinatari));
    // console.log(util.inspect(args.ProtoIn.Allegati));
    // console.log('wsurl:');

    // console.log(WS_IRIDE);

    var soapResult = { result : '....'};
    
    var soapOptions = {
        endpoint: 'http://10.10.129.111:58000/client/services/ProtocolloSoap?CID=COCATEST'
    };

    soap.createClient(WS_IRIDE, soapOptions, function(err, client){
        
        console.log('soap call.....');
        // log2file.debug(client.describe());
        // console.log(client.describe());

        if (err) {
            var msg = 'Errore nella creazione del client soap';
            console.log(err);
            log2file.error(msg);
            log2file.error(err);
           res.status(500).json({
                msg : msg,
                message : err
            });
            return;
        }



        client.InserisciProtocolloEAnagrafiche(args,  function(err, result) {
           
           // log2file.debug(result);
           // console.log(result);

           if (err) {
               var msg = 'Errore nella chiamata ad InserisciProtocollo';
                console.log(client.describe());
                console.log(err);
                log2file.error(msg);
                log2file.error(err);
                console.log(util.inspect(args.ProtoIn.MittentiDestinatari));
                console.log(util.inspect(args.ProtoIn.Allegati));
                // console.log(util.inspect(args.ProtoIn.Allegati2));
 
                res.status(500).json({msg : msg, message : err});
                return;
            };

            //soapResult = result;
            result.modoOperativo = MODO_OPERATIVO;
            log2fileAccess.debug(JSON.stringify(result));
            res.status(200).send(result);

        }); //client.InserisciProtocollo


            // res.status(200).send('ok');

	}); //soap.createClient


    // Memorizzazioni ulteriori

    console.log('Saving data to disk ...');

    // save to disk
   
    var dir = ENV.storagePath + "/" +  ENV_BRAV.storage_folder;
    console.log(dir);
    
    try {
        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
        
        // var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-req.body.txt';
        // fs.writeFileSync(fileName, req.body);

        // var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-req.body.json.txt';
        // fs.writeFileSync(fileName, JSON.stringify(req.body), 'utf-8');

        var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-req.body.util.txt';
        fs.writeFileSync(fileName,util.inspect(req.body), 'utf-8');

        var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-args.txt';
        //str = JSON.stringify(obj, null, 4);
        fs.writeFileSync(fileName,JSON.stringify(args, null, 4), 'utf-8');

        log2fileAccess.debug('2disk!:' + fileName);

    } catch (err) {
        log2file.error('Errore save file!');
    }
    

});


router.get('/leggiProtocollo', function(req, res) {

       // WS_IRIDE = ENV_BRAV.wsiride.url_test;
        WS_IRIDE = ENV_BRAV.wsJiride.url_test;

        console.log(WS_IRIDE);
        console.log('create client....');

        var soapOptions = {
            endpoint: 'http://10.10.129.111:58000/client/services/ProtocolloSoap?CID=COCATEST'
        };


        soap.createClient(WS_IRIDE, soapOptions, function(err, client){
        
            console.log('soap call.....');
            // log2file.debug(client.describe());
            // console.log(client.describe());

            if (err) {
                var msg = 'Errore nella creazione del client soap';
                console.log(err);
                res.status(500).json({
                        msg : msg,
                        message : err
                    });
                return;
            }

            // console.log(client.describe());
    
            var pars = {
                AnnoProtocollo : 2016,
                NumeroProtocollo : 1,
                Utente : "wsalbo",
                Ruolo : "SETTORE SISTEMA INFORMATIVO"
            };

            client.LeggiProtocollo(pars, function(err, result) {
                // log2file.debug(result);
                // console.log(result);

                if (err) {
                    var msg = 'Errore nella chiamata a LeggiProtocollo';
                    //console.log(client.describe());
                    // console.log(err);
                    console.log('##', new Date(), "--------------------------------------");
                    console.log(err.response.request);
                    // log2file.error(msg);
                    // log2file.error(err);
                    res.status(500).json({"msg" : msg, "message" : err.response});
                    return;
                } else {
                    res.status(200).json(result);
                }
   
            }); 
 
        });

        // res.status(201).json('ok');
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

router.get('/j', function(req, res) {
    var Ajv = require('ajv');
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var schema = JSON.parse(fs.readFileSync('./bravSchema.json'));
    var j2validate = JSON.parse(fs.readFileSync('./pacchettoBRAV.json'));


    log2file.debug('Saving data to disk');

    // save to disk
   
    var dir = ENV.storagePath + "/" +  ENV_BRAV.storage_folder;
    log2file.debug('Errore nella creazione del client soap...');
    
    console.log(dir);
    
    try {

        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

        var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '.data';
        console.log(fileName);

        fs.writeFileSync(fileName, j2validate);

        log2file.debug('Data saved!');
        log2file.debug(fileName);
    } catch (err) {
        log2file.error('Errore save file!');
    }

    function base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }


    fs.writeFileSync('./b64PDF.txt', base64_encode('./prova.min.pdf'));
    fs.writeFileSync('./b64JPG.txt', base64_encode('./prova.min.jpg'));
    fs.writeFileSync('./b64TIF.txt', base64_encode('./prova.min.tif'));

    console.log(schema);
    console.log(j2validate);


    
    var validate = ajv.compile(schema);
    var valid = validate(j2validate);
    console.log(valid);
    if (!valid) console.log(validate.errors);
    res.status(201).json(valid);
});



router.get('/i',function(req, res) {

    console.log('i--protocollazione---------------');
    
    var DataProtocollo = "01/01/2000";
    var OggettoDescrizione = "BRAV - TEST - OGGETTO";
    var IdTipoDocumento = ENV_BRAV.wsiride.tipo_documento;
    var CodiceFiscale = 'RGGRGR70E25H294T';
    var CognomeNome = "RUGGERI RUGGERO";
    var DataDiNascita =  "25/05/1970";
    var Note = "NOTE";
    var base64content = new Buffer(Note).toString('base64');


    var args = { 
           ProtoIn : {
                Data: DataProtocollo,
                Classifica: ENV_BRAV.wsiride.classifica,
                TipoDocumento: IdTipoDocumento,
                Oggetto: OggettoDescrizione,
                Origine: 'A',
                MittenteInterno: ENV_BRAV.wsiride.mittente_interno,
                //MittenteInterno_Descrizione": "",
                 
               MittentiDestinatari: {
                MittenteDestinatario: [
                  {
                    CodiceFiscale : CodiceFiscale,
                    CognomeNome: CognomeNome,
                    DataNascita : DataDiNascita,
                    // Nome : 'RUGGERO',
                    // Spese_NProt : 0,
                    // TipoSogg: 'S',
                    // TipoPersona : 'F'
                  }
                ]
              },
              
              AggiornaAnagrafiche : 'S',
              InCaricoA : ENV_BRAV.wsiride.inCaricoA,
              NumeroDocumento : 1,
              NumeroAllegati : 1,
              Utente: ENV_BRAV.wsiride.utente,
              Ruolo: ENV_BRAV.wsiride.ruolo,
               
                Allegati: {
                  Allegato: [
                    {
                      TipoFile : 'txt',
                      ContentType : 'text/plain',
                      Image: base64content,
                      Commento : 'txt'
                    },
                    {
                      TipoFile : 'pdf',
                      ContentType : 'application/pdf',
                      Image: fPDF,
                      Commento : 'PDF'
                    },
                    {
                      TipoFile : 'tiff',
                      ContentType : 'image/tiff',
                      Image: fTIF,
                      Commento : 'TIF'
                    },
                    {
                      TipoFile : 'jpeg',
                      ContentType : 'image/jpeg',
                      Image: fJPG,
                      Commento : 'JPG'
                    }
                  ]
                }
               
            }
        };

    console.log(args);
    console.log('wsurl:');
    console.log(ENV_BRAV.wsiride.url);

    soap.createClient(ENV_BRAV.wsiride.url, function(err, client){
        
        console.log('soap call.....');
        log2file.debug(client.describe());
        console.log(client.describe());

        if (err) {
            console.log(err);
            log2file.error('Errore nella creazione del client soap...');
            log2file.error(err);
            res.status(500).json({message : err});
            return;
        }
 
        client.InserisciProtocollo(args, function(err, result) {
           
           log2file.debug(result);

           if (err) {
                console.log(err);
                log2file.error('Errore nella chiamata ad InserisciProtocollo');
                log2file.error(err);
                res.status(500).json({message : err});
                return;
              // TODO: RISPOSTA CON ERRORI
            };

  
            res.status(200).json({   
                      description : 'Risultato chiamata a protocollo', 
                      message: result 
            });
            return;
        }); //client.InserisciProtocollo
	}); //soap.createClient


    console.log('fine soap!');

});


// route per la protocollazione
router.post('/protocollo', multipartMiddleware, /* utilityModule.ensureAuthenticated, */  function(req, res) {
      console.log('/protocollo .... ');
      
      console.log(req.body);
      console.log(req.query);
      console.log(req.user);

      // var pagesize = parseInt(req.query.pageSize); 
      // var n =  parseInt(req.query.currentPage);
      // var collection = mongocli.get().collection('helpdesk');
      // var rand = Math.floor(Math.random()*100000000).toString();
      // db.users.find().skip(pagesize*(n-1)).limit(pagesize)
      // var searchCriteria = { "userData.userProvider": req.user.userProvider, $and: [ { "userData.userId": req.user.userId } ] };

      var searchCriteria = {};

      // from button OR
      var filterObjArray = [];
      if (req.query.filterButton) {
        if(_.isArray(req.query.filterButton)) {
          _(req.query.filterButton).forEach(function(v){
              console.log(v);
              var regex = new RegExp(".*" + v + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": v   };
              filterObjArray.push(obj1);
          });
        } else {
              var regex = new RegExp(".*" + req.query.filterButton + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": req.query.filterButton   };
              filterObjArray.push(obj1);
        }
      }

      console.log(filterObjArray);      

      // from input text
      if(req.query.filterData){
        var filterData = JSON.parse(req.query.filterData);
        console.log(filterData);
      }

      if(filterData) {
        console.log('1');
        console.log(req.query.filterData);
        if(filterData.globalTxt){
          console.log('2');

          //var stringToGoIntoTheRegex = "abc";
          var regex = new RegExp(".*" + filterData.globalTxt + ".*", "i");
          // at this point, the line above is the same as: var regex = /#abc#/g;

          var filterDataSearchCriteria =  {  "formModel.segnalazione.utenteRichiedenteAssistenza": regex   };
          searchCriteria["formModel.segnalazione.utenteRichiedenteAssistenza"] = regex;
        };    
      }
       
      console.log('----------------searchCriteria----------------------');
      if (!_.isEmpty(filterObjArray)){
          searchCriteria['$or'] =  filterObjArray;
      }
      console.log(searchCriteria);

      collection.find( searchCriteria ).skip(pagesize*(n-1)).limit(pagesize).toArray(function(err, docs) {
        console.log("Found the following records ... ");
        //console.dir(err);
        console.log(err);
        if(err){
            res.status(500).json(err);
        }else{
            res.status(201).json(docs);
        }
      });      
});


router.post('/hdupload', utilityModule.ensureAuthenticated,  multipartMiddleware, function(req, res) {
  console.log('/hduploading.....');
  console.log(req.files);
  console.log('/body.....');
  console.log(req.user);
  console.log(req.body);

  console.log('Counting insert'); 

  //var transactionId = req.body.fields.transactionId;
  var transactionId = 'segnalazioni';
  var ts = utilityModule.getTimestampPlusRandom();
  var dir = DW_PATH + "/" +  transactionId;
  var listOfFiles = [];

  if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

  if (req.files && req.files.files && req.files.files.length) {
    for (var i = 0; i < req.files.files.length; i++) {
      console.log(req.files.files[i].path);
      console.log(req.files.files[i].originalFilename);
      console.log(req.files.files[i].size);

      fs.renameSync(req.files.files[i].path, dir + "/" + ts + "-" + req.files.files[i].originalFilename);

      var oneFile = {
          path : dir,
          ts : ts,
          originalFilename: req.files.files[i].originalFilename,
          type: req.files.files[i].type,
          size :  req.files.files[i].size
      };

      console.log(oneFile);

      listOfFiles.push(oneFile);
    }
  }
  
  console.log(listOfFiles);

  var fileUploadedObj = { "fileUploaded" : oneFile};
  var tsObj = {
        "type" : 'helpdesk', 
        "ts" : new Date()
      };
  var userD = { "userData" : req.user };
  var fullObj = _.merge(req.body.fields, fileUploadedObj, tsObj, userD);

  //console.log(fullObj);

  var collection = mongocli.get().collection('helpdesk'); 

   collection.insert( fullObj, function(err, result) {
      if(err){
        console.log(err);
        return res.status(500).json({ message: 'Error insert segnalazione' });
      } else {
       return res.status(200).json({ message: 'Segnalazione inserted!' }); 
      }

    });
    
});


router.get('/getList', function(req, res) {
      console.log('/getList .... ');
      console.log(req.query);
      console.log(req.user);
      var pagesize = parseInt(req.query.pageSize); 
      var n =  parseInt(req.query.currentPage);
      var collection = mongocli.get().collection('helpdesk');
      var rand = Math.floor(Math.random()*100000000).toString();
      //db.users.find().skip(pagesize*(n-1)).limit(pagesize)
      //var searchCriteria = { "userData.userProvider": req.user.userProvider, $and: [ { "userData.userId": req.user.userId } ] };

      var searchCriteria = {};

      // from button OR
      var filterObjArray = [];
      if (req.query.filterButton) {
        if(_.isArray(req.query.filterButton)) {
          _(req.query.filterButton).forEach(function(v){
              console.log(v);
              var regex = new RegExp(".*" + v + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": v   };
              filterObjArray.push(obj1);
          });
        } else {
              var regex = new RegExp(".*" + req.query.filterButton + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": req.query.filterButton   };
              filterObjArray.push(obj1);
        }
      }


      console.log(filterObjArray);      

      // from input text
      if(req.query.filterData){
        var filterData = JSON.parse(req.query.filterData);
        console.log(filterData);
      }

      if(filterData) {
        console.log('1');
        console.log(req.query.filterData);
        if(filterData.globalTxt){
          console.log('2');

          //var stringToGoIntoTheRegex = "abc";
          var regex = new RegExp(".*" + filterData.globalTxt + ".*", "i");
          // at this point, the line above is the same as: var regex = /#abc#/g;

          var filterDataSearchCriteria =  {  "formModel.segnalazione.utenteRichiedenteAssistenza": regex   };
          searchCriteria["formModel.segnalazione.utenteRichiedenteAssistenza"] = regex;
        };    
      }
       
      console.log('----------------searchCriteria----------------------');
      if (!_.isEmpty(filterObjArray)){
          searchCriteria['$or'] =  filterObjArray;
      }
      console.log(searchCriteria);

      collection.find( searchCriteria ).skip(pagesize*(n-1)).limit(pagesize).toArray(function(err, docs) {
        console.log("Found the following records ... ");
        //console.dir(err);
        console.log(err);
        if(err){
            res.status(500).json(err);
        }else{
            res.status(201).json(docs);
        }
      });      
});

/*
router.get('/download/:identifier', function(req, res) {
  console.log('Get /download/identifier : '+ req.params.identifier);
  flow.write(req.params.identifier, res);
});


router.get('/test', function(req, res) {
  console.log('Get /download/identifier : '+ req.params.identifier);
  res.status(200).send({ok:1});
});

router.get('/map',function(req, res) {
  console.log('/map');
  
  var gUrl = "http://maps.googleapis.com/maps/api/geocode/json?address="+ req.query.address +  "&sensor=false";

  console.log(req.query);

  request.get({
          url: gUrl,
          proxy:'http://M05831:_Giugno2016@proxy1.comune.rimini.it:8080'
        },function (error, response, body) {
            //console.log(body);
            //console.log(response);
            if(error){
              return res.status(500).json(error);    
            } else {
              return res.status(200).send(body);    
            }
        });
  
});


router.post('/add-task', function(req, res) {
  models.Tasks
        .build({
            title: req.body.taskName,
            completed: false})
        .save()
        .then(function() {
          models.Tasks.findAll({}).then(function(taskList) {
                return res.status(200).json(taskList);
            });
        });
});

router.post('/create', function(req, res) {
  console.log(req.body.DICHIARANTI);
  console.log(req.body.NUCLEOFAMILIARE);
  console.log(req.body.UPLOADFILE);
  models.Person
        .build({
            email: req.body.DICHIARANTI.dichiarantePadre,
            title: req.body.DICHIARANTI.dichiaranteMadre,
            name: 'name',
            Blobs : req.body.UPLOADFILE,
            Tasks : [
              { title : 't1', completed : false},
              { title : 't2', completed : true}
              ],
            
            Nucleos: req.body.NUCLEOFAMILIARE,
            },
          {
             include: [ models.Tasks, models.Nucleos, models.Blobs ]
          })
        .save()
        .then(function() {
            models.Person.findAll({
                              include: [{
                                  model: models.Tasks
        //where: { state: Sequelize.col('project.state') }
                                        },
                                      {
                                  model: models.Nucleos
        //where: { state: Sequelize.col('project.state') }
                                        },
                                      {
                                  model: models.Blobs
        //where: { state: Sequelize.col('project.state') }
                                        },

                                        ]
                              }).then(function(taskList) {
                return res.status(200).json(taskList);
            });
        })
        .catch(function(error) {
          console.log(error);
          return res.status(500).json(error);
        });

});

*/

  return router;
}
