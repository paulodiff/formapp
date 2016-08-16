var express = require('express');
var router = express.Router();
var request = require('request');
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
//var models = require("../modelsSequelize");
var dbMysql = require('../models/mysqlModule.js');
var log = require('../models/loggerModule.js');

module.exports = function(){

/* GET home page. */
router.get('/', function(req, res) {
  models.Tasks.all().then(function(taskList) {
        return res.status(200).json(taskList);    
  });
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
  

    /*
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
     }
    */

});



router.get('/user', function(req, res) {
  console.log('get /user');

  var qry  = '';

 
  if (req.query.address) {
    qry  = "SELECT * FROM utentiIRIDE where descFull like '%" +  req.query.address  + "%' LIMIT 10 ";
  } else {
    qry = "SELECT * FROM utentiIRIDE where descFull like '%MIRRA%'";
  }

  console.log(qry);

  dbMysql.get().query(qry, function(err, result) {
    if (err) {
      log.log2console(err);
      return res.status(500).json({ message: err });
    } else {
      log.log2console(result);
      return res.status(200).json({ rows: result });
    }
  })

});



  return router;
}