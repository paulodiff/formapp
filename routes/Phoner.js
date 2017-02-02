// Route for Phone data

var express = require('express');
var router = express.Router();
//var request = require('request');
var os = require('os');
var fs = require('fs');
var path = require('path');
var util = require('util');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var mongocli = require('../models/mongocli');
//var Segnalazione  = require('../models/segnalazione.js'); // load configuration data
var flow = require('../models/flow-node.js')('tmp'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var dbMysql = require('../models/mysqlPhone.js');
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var log = require('../models/loggerModule.js');

var ACCESS_CONTROLL_ALLOW_ORIGIN = false;
//var DW_PATH = (path.join(__dirname, './storage'));
//var DW_PATH = './storage';
var DW_PATH = ENV.storagePath;
var _ = require('lodash');


module.exports = function(){


// GET /api/me
router.get('/getData', function(req, res) {
  console.log('getData');
  //var qry = "select tel_data, tel_ora, tel_chiamato, tel_chiamante, tel_durata from tel_telefonate where tel_chiamato =  '4607' order by tel_timestamp";

  var numTel = '4607';
  var daData = '2017-01-01';
  var aData = '2017-01-31';

  if(req.query.daData){ daData = req.query.daData; }
  if(req.query.aData){ aData = req.query.aData; }
  if(req.query.numTel){ numTel = req.query.numTel; }

  console.log('dataData:', daData);
  console.log('dData:', aData);


  var qry =  "select count(*) as numTelefonate , tel_data";
  qry = qry + " from tel_telefonate ";
  //qry = qry + " where tel_chiamante =  '4607' AND  (tel_data BETWEEN '2016-08-01' AND '2016-08-31') "; 
  qry = qry + " WHERE tel_chiamato =  '" + numTel +  "' ";
  qry = qry + " AND  (tel_data BETWEEN '"+  daData + "' AND '" + aData + "') ";
  qry = qry + " group by tel_data order by tel_data ";


 console.log(qry);

  dbMysql.get().query(qry, function(err, result) {
    if (err) {
      log.log2console(err);
      return res.status(500).json({ dataset: result });
    } else {
      log.log2console(result);

      console.log('Phoner.js-------------------------------------------');

      result.forEach(function(element) {
        console.log(element);
        element.data_ora = new Date(element.tel_data);
      });

      return res.status(200).json({ dataset: result });
    }
  })
});


router.get('/getImage', function(req, res) {

    /*
     var img = fs.readFileSync('./logo.gif');
     res.writeHead(200, {'Content-Type': 'image/gif' });
     res.end(img, 'binary');

   */

    console.log('/getImage');
    console.log(req.query.id);
    var o_id = new mongocli.ObjectID(req.query.id);
    console.log(o_id);
    var collection = mongocli.get().collection('segnalazioni');
    var rand = Math.floor(Math.random()*100000000).toString();
      //db.users.find().skip(pagesize*(n-1)).limit(pagesize)

      collection.find({ "_id":o_id }).toArray(function(err, docs) {
        if(err){
            res.status(500).json(err);
        }else{

          if(docs){
            console.log("Found the following records ... ");
            //console.log(docs);
 
            //console.dir(err);
            console.log(docs[0].fileUploaded);
            //console.log(docs[0].0);

            if (docs[0].fileUploaded) {
              console.log('fileUploaded!');
              var fName = DW_PATH + '/segnalazioni/' + docs[0].fileUploaded.ts + "-" + docs[0].fileUploaded.originalFilename;
              console.log(fName);
              var img = fs.readFileSync(fName);
              res.writeHead(200, {'Content-Type': docs[0].fileUploaded.type });
              res.end(img, 'binary');
            } else {
              if(docs[0].image64){
                  console.log('image64!');
                  var base64result = docs[0].image64.substr(docs[0].image64.indexOf(',') + 1);
                  var img = new Buffer(base64result, 'base64');
                  //console.log(docs[0].image64);
                  res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': img.length
                  });
                  res.end(img);
              } else {
                  console.log('img not found!');
                  res.status(404).json({'msg':'notFound'});
              }
              
            }

            
            //res.status(201).json(docs);

          } else {
            console.log("NOt found");
            res.status(404).json({'msg':'notFound'});
          }

        }
      });      
});



router.get('/getList', utilityModule.ensureAuthenticated, function(req, res) {
      console.log('/getList .... ');
      console.log(req.query);
      console.log(req.user);
      var pagesize = parseInt(req.query.pageSize); 
      var n =  parseInt(req.query.currentPage);
      var collection = mongocli.get().collection('segnalazioni');
      var rand = Math.floor(Math.random()*100000000).toString();
      //db.users.find().skip(pagesize*(n-1)).limit(pagesize)
      var searchCriteria = { "userData.userProvider": req.user.userProvider, $and: [ { "userData.userId": req.user.userId } ] };

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

//{ "ts": { $gt: ISODate("2016-08-01T00:00:00.000+0000") }, $and: [ { "ts": { $lt: "2016-08-30T00:00:00.000Z" } } ] }
//{ "ts": { $gt: "2016-08-01T00:00:00.000+0000" }, $and: [ { "ts": { $lt: "2016-08-30T00:00:00.000Z" } } ] }
//{ "ts": { $gt: ISODate("2016-08-11T00:00:00.000Z") } }
//{ $and: [  { "ts": { $gt: ISODate("2016-08-11T00:00:00.000Z") } } , { "ts": { $lt: ISODate("2016-08-12T00:00:00.000Z") } }    ] }
//{
//    $and: [
//       {
//            "userData.userProvider": "email" 
//        }
//        ,
//        {
//            "userData.userId": "tom@tim.it" 
//        }
//        ,
//        {
//            "ts": {
//                $gte: ISODate("2016-08-09T00:00:00.000+0000"),
//                $lte: ISODate("2016-08-09T23:59:59.999+0000") 
//            }
//        }
//    ]
//}

function checkNumOfSegnalazioni(req, res, next) {

  console.log('##checkNumOfSegnalazioni');
  var qObj = {
     $and: [ 
        {   "userData.userProvider": req.user.userProvider  },
        {   "userData.userId": req.user.userId   },
        {
            "ts": {
                $gte: new Date(utilityModule.getNowFormatted('T00:00:00.000+0000')),
                $lte: new Date(utilityModule.getNowFormatted('T23:59:59.999+0000')) 
            }
        }
      ]
  };
  
  console.log(qObj);

  var collection = mongocli.get().collection('segnalazioni'); 

  collection.find(qObj).count( function(err, result) {
      if(err){
        console.log(err);
        return res.status(500).json({ message: 'Error query DB' });
      } else {
        if (result > ENV.MAX_NUM_SEGNALAZIONI_GIORNALIERE) {
          console.log('## Count STOP!');
          return res.status(501).json({ message: 'Max numero di segnalazioni giornaliere raggiunto.' });
        } else {
          console.log('## Count PASS!');
          next();
        }
      }
   });

}

router.post('/upload', utilityModule.ensureAuthenticated,
                       checkNumOfSegnalazioni,   
                       multipartMiddleware, function(req, res) {
  console.log('/uploading.....');
  console.log(req.files);
  console.log('/body.....');
  console.log(req.user);
  //console.log(req.body);


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
        "type" : 'segnalazione', 
        "ts" : new Date()
      };
  var fullObj = _.merge(req.body.fields, fileUploadedObj, tsObj);

  //console.log(fullObj);

  var collection = mongocli.get().collection('segnalazioni'); 

   collection.insert(  fullObj  , function(err, result) {
      if(err){
        console.log(err);
        return res.status(500).json({ message: 'Error insert segnalazione' });
      } else {
       return res.status(200).json({ message: 'Segnalazione inserted!' }); 
      }

    });
    
});


// ----------------------------------------------------------------------------------------------------------------------------------

router.post('/uploadOld', multipartMiddleware, function(req, res) {
  console.log('/upload call $flow.post ...');
  //console.log(req);
  var transactionId = req.body.transactionId;
  flow.post(req, function(status, filename, original_filename, identifier) {
    console.log('callback POST', status, original_filename, identifier);
    console.log('status', status);
    console.log('original_filename', original_filename);
    console.log('identifier', identifier);

    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }

    if (status == 'partly_done') {
      status = 200;
    }

    if (status == 'done') {

      var dir = DW_PATH + "/" +  transactionId;
      if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
      var dw_fileName = dir + "/" + original_filename;
      console.log('writing ...',dw_fileName);
      var stream = fs.createWriteStream(dw_fileName);
      flow.write(identifier, stream);
      //stream.on('data', function(data){...});
      //stream.on('finish', function(){...});
      
      status = 200;
    }

    if (status == 'invalid_flow_request')  {   status = 501;  } 
    if (status == 'non_flow_request')      {   status = 501;  } 
    if (status == 'invalid_flow_request1') {   status = 501;  } 
    if (status == 'invalid_flow_request2') {   status = 502;  } 
    if (status == 'invalid_flow_request3') {   status = 503;  } 
    if (status == 'invalid_flow_request4') {   status = 504;  } 

    res.status(status).send();
  });
});

router.options('/upload', function(req, res){
  console.log('OPTIONS');
  if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.status(200).send();
});

// Handle status checks on chunks through Flow.js
router.get('/upload', function(req, res) {
  console.log('GET / upload', status);
  flow.get(req, function(status, filename, original_filename, identifier) {
    console.log('GET', status);
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }

    if (status == 'found') {
      status = 200;
    } else {
      status = 204;
    }

    res.status(status).send();
  });
});

router.get('/download/:identifier', function(req, res) {
  console.log('Get /download/identifier : '+ req.params.identifier);
  flow.write(req.params.identifier, res);
});


router.get('/test', function(req, res) {
  console.log('Get /download/identifier : '+ req.params.identifier);
  console.log('Counting insert'); 
  console.log(utilityModule.getNowFormatted());
  console.log(utilityModule.getNowFormatted('T00:00:00.000+0000'));
  console.log(utilityModule.getNowFormatted('T23:59:59.999+0000'));

  var qObj = {
     $and: [ 
        {   "userData.userProvider": "email"  },
        {   "userData.userId": "tom@tim.it"   },
        {
            "ts": {
                $gte: new Date(utilityModule.getNowFormatted('T00:00:00.000+0000')),
                $lte: new Date(utilityModule.getNowFormatted('T23:59:59.999+0000')) 
            }
        }
    ]
};
 
  var collection = mongocli.get().collection('segnalazioni'); 

  collection.find(qObj).count( function(err, result) {
      if(err){
        console.log(err);
        return res.status(500).json({ message: 'Error insert segnalazione' });
      } else {
       console.log(result);
       res.status(200).send({ok: result}); 
      }
   });

  
});


/*
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