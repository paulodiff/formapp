var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var User  = require('../models/user.js'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); // load configuration data
var request = require('request');
var qs = require('querystring');
var path = require('path');


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
      res.send({ token: utilityModule.createJWT(user) });
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
    console.log('/signup saving user');
    console.log(user);
    user.save(function(err, result) {
      if (err) {
      	console.log(err);
        res.status(500).send({ message: err.message });
      }
      res.status(200).send({ token: utilityModule.createJWT(result) });
    });
  });
});


/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
 */

router.post('/github', function(req, res) {

  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: ENV.GITHUB_SECRET,
    redirect_uri: req.body.redirectUri
  };



  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {

    console.log('GitHub exchange ...');

    accessToken = qs.parse(accessToken);
    var headers = { 'User-Agent': 'Satellizer' };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

      console.log('Github retrieve profile information');
      
      if(err) {
        console.log(err);
        res.status(409).send({ message: 'Error retrieve profile information!' });
      }

      console.log(profile);

      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        console.log('Github **Authorization** search:' + profile.id);
        User.findOne({ github: profile.id }, function(err, existingUser) {

          if(err) {
            console.log(err);
            res.status(409).send({ message: 'Error finding user!' });
          }

         if (existingUser) {
            console.log('Github existing user!');
            console.log(existingUser);
            return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, ENV.secret);
          console.log(payload.sub);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              console.log('GitHub User not found');
              return res.status(400).send({ message: 'User not found' });
            }
            user.github = profile.id;
            user.picture = user.picture || profile.avatar_url;
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              console.log('Github saving user');              console.log(user);
              var token = utilityModule.createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        console.log('GitHub find ...' );
        console.log(profile.id);
        User.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            console.log('Github existing User..');
            var token = utilityModule.createJWT(existingUser);
            return res.send({ token: token });
          }
          var user = new User();
          user.github = profile.id;
          user.picture = profile.avatar_url;
          user.displayName = profile.name;
          user.save(function(err, user ) {

            if(err) {
              console.log(err);
              res.status(409).send({ message: 'Error saving user!' });
            } else {
              console.log('Github saving user...');
              console.log(user);
              var token = utilityModule.createJWT(user);
              res.send({ token: token });
            }
          });
        });
      }
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
    client_secret: ENV.GOOGLE_SECRET,
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
          var payload = jwt.decode(token, ENV.secret);
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

/*
 |--------------------------------------------------------------------------
 | Login with Twitter
 |--------------------------------------------------------------------------
 */
router.post('/twitter', function(req, res) {
  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

  // Part 1 of 2: Initial request from Satellizer.
  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: ENV.TWITTER_KEY,
      consumer_secret: ENV.TWITTER_SECRET,
      callback: req.body.redirectUri
    };

    // Step 1. Obtain request token for the authorization popup.
    request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
      var oauthToken = qs.parse(body);

      // Step 2. Send OAuth token back to open the authorization screen.
      res.send(oauthToken);
    });
  } else {
    // Part 2 of 2: Second request after Authorize app is clicked.
    var accessTokenOauth = {
      consumer_key: ENV.TWITTER_KEY,
      consumer_secret: ENV.TWITTER_SECRET,
      token: req.body.oauth_token,
      verifier: req.body.oauth_verifier
    };

    // Step 3. Exchange oauth token and oauth verifier for access token.
    request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: ENV.TWITTER_KEY,
        consumer_secret: ENV.TWITTER_SECRET,
        oauth_token: accessToken.oauth_token
      };

      // Step 4. Retrieve profile information about the current user.
      request.get({
        url: profileUrl + accessToken.screen_name,
        oauth: profileOauth,
        json: true
      }, function(err, response, profile) {

        // Step 5a. Link user accounts.
        if (req.header('Authorization')) {
          User.findOne({ twitter: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
            }

            var token = req.header('Authorization').split(' ')[1];
            var payload = jwt.decode(token, ENV.TOKEN_SECRET);

            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }

              user.twitter = profile.id;
              user.displayName = user.displayName || profile.name;
              user.picture = user.picture || profile.profile_image_url.replace('_normal', '');
              user.save(function(err) {
                res.send({ token: utilityModule.createJWT(user) });
              });
            });
          });
        } else {
          // Step 5b. Create a new user account or return an existing one.
          User.findOne({ twitter: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: utilityModule.createJWT(existingUser) });
            }

            var user = new User();
            user.twitter = profile.id;
            user.displayName = profile.name;
            user.picture = profile.profile_image_url.replace('_normal', '');
            user.save(function() {
              res.send({ token: utilityModule.createJWT(user) });
            });
          });
        }
      });
    });
  }
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