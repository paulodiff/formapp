// Route for upload

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

var ACCESS_CONTROLL_ALLOW_ORIGIN = false;
//var DW_PATH = (path.join(__dirname, './storage'));
//var DW_PATH = './storage';
var DW_PATH = ENV.storagePath;
var _ = require('lodash');


module.exports = function(){

/*
router.get('/getImage', function(req, res) {

    
    // var img = fs.readFileSync('./logo.gif');
    // res.writeHead(200, {'Content-Type': 'image/gif' });
    // res.end(img, 'binary');

   

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

*/

//{ "ts": { $gt: ISODate("2016-08-01T00:00:00.000+0000") }, $and: [ { "ts": { $lt: "2016-08-30T00:00:00.000Z" } } ] }
//{ "ts": { $gt: "2016-08-01T00:00:00.000+0000" }, $and: [ { "ts": { $lt: "2016-08-30T00:00:00.000Z" } } ] }
//{ "ts": { $gt: ISODate("2016-08-11T00:00:00.000Z") } }

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
  
      var searchCriteria = {  };

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