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
//var request = require('request');
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
//var Segnalazione  = require('../models/segnalazione.js'); // load configuration data
var flow = require('../models/flow-node.js')('tmp'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); 
var logger  = require('../models/loggerModule.js'); 

var ACCESS_CONTROLL_ALLOW_ORIGIN = false;
//var DW_PATH = (path.join(__dirname, './storage'));
//var DW_PATH = './storage';
var DW_PATH = ENV.storagePath;
var _ = require('lodash');

var log4js  = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', 
      filename: 'log/' + ENV_BRAV.log_filename, 
      category: 'file-logger',
      maxLogSize: 120480,
      backups: 10,
      category: 'file-logger' 
    }
  ]
});
var logger = log4js.getLogger();
// init logging
var logCon  = log4js.getLogger();
// var loggerDB = log4js.getLogger('mongodb');
var log2file = log4js.getLogger('file-logger');


module.exports = function(){


router.get('/ping', function (req, res) {
  res.send('BRAV route pong!');
});

router.get('/j', function(req, res) {
    var Ajv = require('ajv');
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var schema = JSON.parse(fs.readFileSync('./bravSchema.json'));
    var j2validate = JSON.parse(fs.readFileSync('./pacchettoBRAV.json'));


    // save to disk
   
    var dir = ENV.storagePath + "/" +  ENV_BRAV.storage_folder;
    console.log(dir);
    
    if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

    var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '.data';
    console.log(fileName);

    fs.writeFileSync(fileName, j2validate);

    
    function base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }


    // console.log(base64_encode('./prova.pdf'));

    console.log(schema);
    console.log(j2validate);

    var validate = ajv.compile(schema);
    var valid = validate(j2validate);
    console.log(valid);
    if (!valid) console.log(validate.errors);
    res.status(201).json(valid);
});


router.get('/i',function(req, res) {
    console.log('i-----------------');
    console.log(ENV.wsiride.url_test);


    
    var DataProtocollo = "01/01/2016";
    var OggettoDescrizione = "TEST - OGGETTO";
    var IdTipoDocumento = '01001';
    var CodiceFiscale = '01001';
    var CognomeNome = "RUGGERI RUGGERO";
    var DataDiNascita =  "25/05/1970";
    var Note = "NOTE";
    var base64content = new Buffer(Note).toString('base64');


    var args = { 
           ProtoIn : {
                Data: DataProtocollo,
                Oggetto: OggettoDescrizione,
                Origine: 'A',
                Classifica: '001 006 001',
                TipoDocumento: IdTipoDocumento,
                MittenteInterno: '460',
                //MittenteInterno_Descrizione": "",
                 
               MittentiDestinatari: {
                MittenteDestinatario: [
                  {
                    CodiceFiscale : CodiceFiscale,
                    CognomeNome: CognomeNome,
                    DataNascita : DataDiNascita,
                    // Nome : 'RUGGERO',
                    Spese_NProt : 0,
                    TipoSogg: 'S',
                    TipoPersona : 'F'
                  }
                ]
              },
              
              AggiornaAnagrafiche : 'F',
              InCaricoA : '460',
              NumeroDocumento : 1,
              NumeroAllegati : 0,
              Utente: 'M09673',
              Ruolo: 'SETTORE SISTEMA INFORMATIVO',
               
                Allegati: {
                  Allegato: [
                    {
                      TipoFile : 'txt',
                      ContentType : 'text/plain',
                      Image: base64content,
                      Commento : 'txt'
                    }

                  ]
                }
               
            }
        };


    console.log(args);

    soap.createClient(ENV.wsiride.url_test, function(err, client){
        
        console.log('soap call.....');
        log2file.debug(client.describe());

        if (err) {
            console.log(err);
            log2file.debug('Errore nella creazione del client soap...');
            log2file.debug(err);
            res.status(500).json({message : err});
            return;
        }
 
        client.InserisciProtocollo(args, function(err, result) {
           
           log2file.debug(result);

           if (err) {
                console.log(err);
                log2file.debug('Errore nella chiamata ad InserisciProtocollo');
                log2file.debug(err);
                res.status(500).json({message : err});
                return;
              // TODO: RISPOSTA CON ERRORI
            };

  
            res.status(200).json({   
                      success: true,
                      description : 'Protocollo inserito con successo', 
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

/*

{
    $or: [
        {
            "formModel.segnalazione.utenteRichiedenteAssistenza": /.*M03985.* /i 
        }
        ,
        {
            "formModel.segnalazione.utenteRichiedenteAssistenza": /.*M05831.* /i 
        }
    ]
    ,
    $and: [
        {
            "ts": ISODate("2016-08-24T07:53:53.560+0000") 
        }
    ]
}

*/

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

/*

{
    $or: [
        {
            "formModel.segnalazione.utenteRichiedenteAssistenza": /.*M03985.* /i 
        }
        ,
        {
            "formModel.segnalazione.utenteRichiedenteAssistenza": /.*M05831.* /i 
        }
    ]
    ,
    $and: [
        {
            "ts": ISODate("2016-08-24T07:53:53.560+0000") 
        }
    ]
}

*/

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
