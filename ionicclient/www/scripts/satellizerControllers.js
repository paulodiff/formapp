angular.module('myApp.controllers')
  .controller('SLoginCtrl', 
           ['$scope', '$auth', '$state', '$rootScope', 'sigService', '$state','ENV', '$log',
    function($scope,   $auth,   $state,  $rootScope,   sigService,  $state,  ENV ,  $log ) {

    $scope.profileInfo = {};

    $scope.login = function() {
        $log.debug('login');
      $auth.login($scope.user)
        .then(function() {
          //dialogs.notify('ok','You have successfully signed in!');
          //$log.debug($scope.user);
          $log.debug('You have successfully signed in!');
          $state.go('home');
        })
        .catch(function(error) {
          $log.debug('login error:');
          $log.debug(error);
          if (error.data) {
            //dialogs.error('Errore',error.data.message);
            $log.debug(error.data);
          } else
            //dialogs.error('Errore','Errore generico di accesso');
            $log.debug('Errore','Errore generico di accesso');
        });
    };

    $scope.authenticate = function(provider) {
      $log.debug('authenticate');
      $auth.authenticate(provider)
        .then(function() {
          //dialogs.notify('ok','You have successfully signed in with ' + provider + '!');
          $log.debug('You have successfully signed in with ' + provider + '!');

          $log.debug('Get Profile info');

          $scope.profileInfo  = $auth.getPayload();
          $log.debug('Get segnaòazopmo');


          //$state.go('home');
        })
        .catch(function(error) {
          if (error.error) {
            // Popup error - invalid redirect_uri, pressed cancel button, etc.
            $log.error(error);
            //dialogs.error(error);
          } else if (error.data) {
            // HTTP response error from server
            $log.error(error);
            //dialogs.error(error);
          } else {
            $log.error(error);
            //dialogs.error(error);
          }
        });
    };
    
    $scope.logout = function(){
        $log.debug('logout');
        console.log($auth.getToken());
        console.log($auth.getPayload());
        $auth.logout()
            .then(function() {
                $log.debug('You have been logged out');
                //$state.go('home');
            })
            .catch(function(error) {
                 $log.error(error);
            });

    };

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    $scope.nuovaSegnalazione = function (){
        $state.go('menu.map');
    }

  }])

  .controller('SLogoutCtrl', 

           ['$scope', '$auth', '$rootScope', 'AuthService', 'Session', '$state','ENV', '$log',
    function($scope,   $auth,   $rootScope,   AuthService,   Session,   $state,  ENV ,  $log ) {

    if (!$auth.isAuthenticated()) { return; }
    $auth.logout()
      .then(function() {
        //dialogs.notify('ok','You have been logged out');
        $state.go('home');
      });
  }])

  .controller('SProfileCtrl', 

           ['$scope', '$auth', '$rootScope', 'AuthService', 'Session', '$state','ENV', '$log', 'Account',
    function($scope,   $auth,   $rootScope,   AuthService,   Session,   $state,  ENV ,  $log,   Account ) {


    $scope.getProfile = function() {
      Account.getProfile()
        .then(function(response) {
          $scope.user = response.data;
        })
        .catch(function(response) {
          //dialogs.error('err', response.data.message + response.status);
        });
    };
    $scope.updateProfile = function() {
      Account.updateProfile($scope.user)
        .then(function() {
          //dialogs.notify('ok','Profile has been updated');
        })
        .catch(function(response) {
          //dialogs.error('err',response.data.message, response.status);
        });
    };
    $scope.link = function(provider) {
      $auth.link(provider)
        .then(function() {
          dialogs.notify('You have successfully linked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          dialogs.error(response.data.message, response.status);
        });
    };
    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          dialogs.notify('You have unlinked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          dialogs.error(response.data ? response.data.message : 'Could not unlink ' + provider + ' account', response.status);
        });
    };

    $scope.getProfile();
  }])


  .controller('SSignupCtrl', 

           ['$scope',  '$auth', '$rootScope', 'AuthService', 'Session', '$state','ENV', '$log',
    function($scope,    $auth,   $rootScope,   AuthService,   Session,   $state,  ENV ,  $log ) {

    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $state.go('home');
          //dialogs.notify('You have successfully created a new account and have been signed-in');
        })
        .catch(function(response) {
          console.log(response);
          //dialogs.error('Errore','Signup Error');
        });
    };
  }])


.controller('SHomeCtrl', function($scope, $http) {
    $http.jsonp('https://api.github.com/repos/sahat/satellizer?callback=JSON_CALLBACK')
      .success(function(data) {
        if (data) {
          if (data.data.stargazers_count) {
            $scope.stars = data.data.stargazers_count;
          }
          if (data.data.forks) {
            $scope.forks = data.data.forks;
          }
          if (data.data.open_issues) {
            $scope.issues = data.data.open_issues;
          }
        }
      });
  })

  .controller('SNavbarCtrl',

           ['$scope', 'dialogs', '$auth', '$rootScope', 'AuthService', 'Session', '$state','ENV', '$log',
    function($scope,   dialogs,   $auth,   $rootScope,   AuthService,   Session,   $state,  ENV ,  $log ) {

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
  }]);    