var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var User  = require('../models/user.js'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data

module.exports = function(){


 // Log in with Email
router.post('/login', function(req, res) {
  console.log('/login');
  utilityModule.test();
  User.findOne({ email: req.body.email }, '+password', function(err, user) {
  	if(err) console.log(err);
    if (!user) {
      console.log('NOT user..');
      return res.status(401).send({ message: 'Invalid email and/or password' });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if(err) console.log(err);
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email and/or password' });
      }
      res.send({ token: UtilityModule.createJWT(user) });
    });
  });
});


//Create Email and Password Account
router.post('/signup', function(req, res) {
  console.log('/signup');
  User.findOne({ email: req.body.email }, function(err, existingUser) {
  	if(err) console.log(err);
    if (existingUser) {
      console.log('409 Email is already taken');
      return res.status(409).send({ message: 'Email is already taken' });
    }
    var user = new User({
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function(err, result) {
      if (err) {
      	if(err) console.log(err);
        res.status(500).send({ message: err.message });
      }
      res.send({ token: createJWT(result) });
    });
  });
});



//Login with Google
router.post('/google', function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({message: profile.error.message});
      }
      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.google = profile.sub;
            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = utilityModule.createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.send({ token: utilityModule.createJWT(existingUser) });
          }
          var user = new User();
          user.google = profile.sub;
          user.picture = profile.picture.replace('sz=50', 'sz=200');
          user.displayName = profile.name;
          user.save(function(err) {
            var token = utilityModule.createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});


// unlink data
router.post('/unlink', utilityModule.ensureAuthenticated, function(req, res) {
  var provider = req.body.provider;
  var providers = ['facebook', 'foursquare', 'google', 'github', 'instagram',
    'linkedin', 'live', 'twitter', 'twitch', 'yahoo'];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({ message: 'Unknown OAuth Provider' });
  }

  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User Not Found' });
    }
    user[provider] = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
});


router.all('/test', function(req,res){
	console.log('test');
	res.status(500).json({'mgs':'pong'});
});

/*
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


	router.all('/signup', function(req, res){
		res.status(500).json({'mgs':'pong'});
	});

		
	router.get('/signout', function(req, res) {
		res.status(500).json({'mgs':'pong'});
	});

	*/

	return router;
}