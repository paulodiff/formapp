'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

angular.module('myApp.services', [])
   
  .service('VersionService', [function() {
      return '1.0.2';
  }])


.factory('AuthService',           ['ENV', '$http', 'Session', '$rootScope', '$log',
                         function ( ENV,   $http,   Session,   $rootScope,   $log) {
  return {

    login: function (credentials) {

      $log.debug( $rootScope.base_url + ENV.apiLogin);
        
      return $http({ 
                    url: $rootScope.base_url + ENV.apiLogin, 
                    method: "GET",
                    params: {username: credentials.username, password: credentials.password }
                  })
        .then(function (res) {
            $log.debug('AuthService login then');
            $log.debug(res.data);
            Session.create(res.data);
        });
    },
      
    logout: function (credentials) {
        $log.debug('AuthService logout');
        $log.debug( $rootScope.base_url + ENV.apiLogout);
      return $http
        .get( $rootScope.base_url + ENV.apiLogout, credentials)
        .then(function (res) {
            $log.debug('AuthService logout ...');
            $log.debug(res);
            $log.debug(res.data.id_utenti);
            $log.debug('Destroy session ...');
            Session.destroy();
        });
    },  
      
    isAuthenticated: function () {
        $log.debug('AuthService isAuthenticated');
        return !!Session.id_utenti;
    },
      
    isAuthorized: function (authorizedRoles) {
        $log.debug('AuthService isAuthorized');
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (this.isAuthenticated() &&
        authorizedRoles.indexOf(Session.userRole) !== -1);
    }
  };
}])

.service('Session',  ['$log', function ($log) {
  this.create = function (data) {
    $log.debug('Session create ...');
    $log.debug(data);
    this.session_data = {};
    this.session_data = data;
  };
  this.destroy = function () {
    $log.debug('Session destroy');
    this.session_data = {};
  };
  return this;
}]);