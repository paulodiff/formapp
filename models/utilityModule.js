var jwt = require('jwt-simple');
var moment = require('moment');


module.exports = {

  test : function(){
    console.log('test');
  },

  ensureAuthenticated : function(req, res, next) {
        console.log('ensureAuthenticated');
        if (!req.header('Authorization')) {
            console.log('ensureAuthenticated : 401');
            return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
        }
        var token = req.header('Authorization').split(' ')[1];

          var payload = null;
          try {
            payload = jwt.decode(token, config.TOKEN_SECRET);
          }
          catch (err) {
            console.log(err);
            return res.status(401).send({ message: err.message });
          }

          if (payload.exp <= moment().unix()) {
            console.log('token expired');
            return res.status(401).send({ message: 'Token has expired' });
          }
          console.log('ok next');
          req.user = payload.sub;
          next();
    },

    createJWT: function(user) {
          var payload = {
            sub: user._id,
            iat: moment().unix(),
            exp: moment().add(14, 'days').unix()
          };
          return jwt.encode(payload, config.TOKEN_SECRET);
    }


}

/*
// utility Middleware Module
module.exports = function () {
    var module = {};

    module.ensureAuthenticated = function(req, res, next) {
        console.log('ensureAuthenticated');
        if (!req.header('Authorization')) {
            console.log('ensureAuthenticated : 401');
            return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
        }
        var token = req.header('Authorization').split(' ')[1];

          var payload = null;
          try {
            payload = jwt.decode(token, config.TOKEN_SECRET);
          }
          catch (err) {
            console.log(err);
            return res.status(401).send({ message: err.message });
          }

          if (payload.exp <= moment().unix()) {
            console.log('token expired');
            return res.status(401).send({ message: 'Token has expired' });
          }
          console.log('ok next');
          req.user = payload.sub;
          next();
    };



    module.createJWT = function(user) {
          var payload = {
            sub: user._id,
            iat: moment().unix(),
            exp: moment().add(14, 'days').unix()
          };
          return jwt.encode(payload, config.TOKEN_SECRET);
    };

    module.test = function(){
        console.log('module test function');
    };


    // Other stuff...
    module.pickle = function(cucumber, herbs, vinegar) {
        // This will be available 'outside'.
        // Pickling stuff...
    };

    function jarThemPickles(pickle, jar) {
        // This will be NOT available 'outside'.
        // Pickling stuff...

        return pickleJar;
    };

    return module;
};
*/