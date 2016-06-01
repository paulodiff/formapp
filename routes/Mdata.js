var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
//var User  = require('../models/user.js'); // load configuration data
var dbMysql = require('../models/mysqlModule.js');
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var log = require('../models/loggerModule.js');

//admin > statuses
//app.get('/admin/statuses/', require('./views/admin/statuses/index').find);
//app.post('/admin/statuses/', require('./views/admin/statuses/index').create);
//app.get('/admin/statuses/:id/', require('./views/admin/statuses/index').read);
//app.put('/admin/statuses/:id/', require('./views/admin/statuses/index').update);
//app.delete('/admin/statuses/:id/', require('./views/admin/statuses/index').delete);

module.exports = function(){

// GET /api/me
router.get('/tdemo', function(req, res) {
  console.log('get /me');
  dbMysql.get().query('SELECT * FROM tdemo', function(err, result) {
    if (err) {
      log.log2console(err);
      return res.status(500).json({ message: result });
    } else {
      log.log2console(result);
      return res.status(200).json({ message: result });
    }
  })
});


// GET /api/me
router.get('/tdemo/:id/', function(req, res) {
  console.log('get /me/id');
  console.log(req.params.id)
  dbMysql.get().query('SELECT * FROM tdemo WHERE id =  ?',req.params.id, function(err, result) {
    if (err) {
      log.log2console(err);
      return res.status(500).json({ message: result });
    } else {
      log.log2console(result);
      return res.status(200).json({ message: result });
    }
  })
});


// CREATE data
router.post('/tdemo', function(req, res) {
  console.log('POST /tdemo');
  var row = {
    text : req.body.text || 'text',
    number : req.body.number || 99999,
    date: req.body.date || new Date(),
    time: req.body.time || new Date(),
    datetime: req.body.datetime || new Date()
  };
  
  dbMysql.get().query('INSERT INTO tdemo SET ?',row, function(err, result) {
    if (err) {
      log.log2console(err);
      return res.status(500).json({ message: result });
    } else {
      log.log2console(result);
      return res.status(200).json({ message: result, lastId: result.insertId });
    }
  })

  //var sql = "SELECT * FROM ?? WHERE ?? = ?";
  //var inserts = ['users', 'id', userId];
  //sql = mysql.format(sql, inserts);
  //connection.query('INSERT INTO posts SET ?', {title: 'test'}, function(err, result) {
  //  if (err) throw err;
  //  console.log(result.insertId);
  //});

});



//PUT /api/me update
router.put('/tdemo', function(req, res) {
  console.log('POST /tdemo');

  var tdemo_Id =  req.body.id || 0;

  var row = {
    text : req.body.text || 'update:' + new Date()
  };
  
  dbMysql.get().query('UPDATE tdemo SET text = ? WHERE id = ?', [row.text, tdemo_Id], function(err, result) {
    if (err) {
      log.log2console(err);
      return res.status(500).json({ message: result });
    } else {
      log.log2console(result);
      return res.status(200).json({ message: result, updated_id: tdemo_Id });
    }
  })
});

//DELETE /api/me update
router.delete('/tdemo', function(req, res) {
    console.log('DELETE /tdemo TODO');
    return res.status(200).json({ message: 'DELETE TDEMO TODO' });
});


	return router;
}