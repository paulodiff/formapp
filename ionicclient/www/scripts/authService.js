'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

angular.module('myApp.services')
   
  .service('VersionService', [function() {
      return '1.0.2';
  }])


.factory('AuthService',           ['ENV', '$http', 'Session', '$rootScope', '$log',
                         function ( ENV,   $http,   Session,   $rootScope,   $log) {
  return {

    login: function (credentials) {

      $log.debug( $rootScope.base_url + ENV.apiLogin);
        
      return $http
        .post($rootScope.base_url + ENV.apiLogin, credentials)
        .then(function (res) {
            $log.debug('AuthService login then');
            $log.debug(res);
            $log.debug(res.data.id_utenti);
            Session.create(res.data.id_utenti, res.data.nome_breve_utenti, res.data.token,  res.data.isadmin_utenti);
        });
    },
      
    logout: function (credentials) {
        $log.debug('AuthService logout');
        $log.debug( $rootScope.base_url + ENV.apiLogout);
      return $http
        .post( $rootScope.base_url + ENV.apiLogout, credentials)
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
  this.create = function (id_utenti, nome_breve_utenti, token, isAdmin) {
    $log.debug('Session create id:' + id_utenti);
    $log.debug('Session nome_breve_utenti:' + nome_breve_utenti);
    $log.debug('Session token:' + token);
    $log.debug('Session isAdmin:' + isAdmin);
    this.id_utenti = id_utenti;
    this.nome_breve_utenti = nome_breve_utenti;
    this.token = token;
    this.isAdmin = isAdmin;
  };
  this.destroy = function () {
     $log.debug('Session destroy');
    this.id_utenti = null;
    this.nome_breve_utenti = null;
    this.token = null;
    this.isAdmin = false;
  };
  return this;
}]);