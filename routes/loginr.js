var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var ENV   = require('../config.js'); // load configuration data

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

var isLoggedIn = function(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = function(passport){

	/*
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});
	*/


	router.all('/test', function(req,res){
		//console.log(req);
		res.status(500).json({'mgs':'pong'});
	});


	router.all('/login', function(req, res, next) {
	  passport.authenticate('login', function(err, user, info) {
	    if (err) { 
	  			console.log(err);
	  			console.log(info);
	    		res.status(500).json({'mgs':err});
	    		return;
	    }

	    if (!user) { 
	    		console.log('not user');
	  			console.log(info);
	    		res.status(401).json({'mgs':'not user'});
	    		return;
	    	}

	    if(user) {
	    		console.log('ok');
	    		var token = jwt.sign(user, ENV.secret, { expiresIn : "2h"});
	    		res.status(200).json({'mgs':'ok user', 'user': user, 'token' : token});
	    		return;
	    }

	})(req, res, next);
	});


	router.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });


	/* GET Registration Page */
	router.all('/signup', function(req, res){
		res.status(500).json({'mgs':'pong'});
	});

		
	/* Handle Logout */
	router.get('/signout', function(req, res) {
		res.status(500).json({'mgs':'pong'});
	});

	return router;
}