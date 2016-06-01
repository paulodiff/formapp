var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var models = require("../modelsSequelize");

module.exports = function(){

/* GET home page. */
router.get('/', function(req, res) {
  models.Tasks.all().then(function(taskList) {
        return res.status(200).json(taskList);    
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

router.post('/test', function(req, res) {
  //console.log(req.body);
  //console.log(req.body.NUCLEOFAMILIARE);
  models.Person
        .build({
            email: req.body.DICHIARANTI.DichiarantePadre,
            title: req.body.DICHIARANTI.DichiaranteMadre,
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
        });
/*
Product.create({
  id: 1,
  title: 'Chair',
  Tags: [
    { name: 'Alpha'},
    { name: 'Beta'}
  ]
}, {
  include: [ Tag ]
})
*/
/*
task.save().catch(function(error) {
  // mhhh, wth!
})
*/


});

  return router;
}

