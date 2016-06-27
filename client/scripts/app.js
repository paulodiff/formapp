"use strict";
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('myApp', [//'ionic',
                         'ui.bootstrap',   
                         'ui.router',
                         'ui.select',
                         'dialogs.main',
                         'formly',
                         'formlyBootstrap',
                         'satellizer',
                         'ngResource',
                         'ngSanitize',
                         'ngMessages',
                         //'naif.base64',
                         //'ngCordova',
                         'angularSpinner',
                         'restangular',
                         'ngAnimate',
                         //'ngMockE2E',
                         'ngStorage',
                         'ngFileUpload',
                         'ui.grid',
                         'ui.grid.selection',
                         //'uiGmapgoogle-maps',
                         'myApp.filters',
                         'myApp.services',
                         'myApp.directives',
                         'myApp.controllers',
                         'myApp.config'])
                         //'myApp.mockBackend',
                         //'myApp.mockService'])


// enable disable LOG
.config(function($logProvider){
    $logProvider.debugEnabled(true);
})

/*
// config uiGmapgoogle-maps
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCbkb0dHm-FqvVSf44vd8hr4l6rDHRxGzE',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
})
*/

// ui.router configuration
.config(  ['$stateProvider', '$urlRouterProvider',
  function($stateProvider,    $urlRouterProvider) {
    // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
    // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
    // Here we are just setting up some convenience urls.
    //.when('/c?id', '/contacts/:id')
    //.when('/user/:id', '/contacts/:id')
    // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
    $urlRouterProvider.otherwise('/login');
    
    $stateProvider.state('menu', {
            url: "/menu",
            abstract: true,
            templateUrl: "templates/mainDashboard.html"
    });
    
   
    $stateProvider.state('menu.home',{
            url: '/home',
            templateUrl: "templates/loginDashboard.html",
            controller:'LoginController',
            accessLogged: false,
            accessLevel: 'free1' 
    });


    $stateProvider.state('home', {
        url: '/',
        controller: 'SHomeCtrl',
        templateUrl: 'templates/Shome.html',
        accessLogged: false,
        accessLevel: 'free1' 
    });

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'templates/Slogin.html',
        controller: 'SLoginCtrl',
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn
        }
    });

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'templates/Ssignup.html',
        controller: 'SSignupCtrl',
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn
        }
    });

    $stateProvider.state('logout', {
        url: '/logout',
        template: null,
        controller: 'SLogoutCtrl'
    });
      
    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'templates/Sprofile.html',
        controller: 'SProfileCtrl',
        resolve: {
          loginRequired: loginRequired
        }
    });

    $stateProvider.state('form', {
        url: '/form',
        templateUrl: 'templates/formly.html',
        controller: 'SFormlyCtrl',
        controllerAs: 'vm',
        resolve: {
          //loginRequired: loginRequired
        }
    });

    $stateProvider.state('formAsync', {
        url: '/formAsync',
        templateUrl: 'templates/formlyAsync.html',
        controller: 'SFormlyAsyncCtrl',
        controllerAs: 'vm',
        resolve: {
          loginRequired: loginRequired
        }
    });

    $stateProvider.state('uigrid', {
        url: '/uigrid',
        templateUrl: 'templates/uiGrid.html',
        controller: 'UiGridCtrl',
        controllerAs: 'vm',
        resolve: {
          loginRequired: loginRequired
        }
    });


    function skipIfLoggedIn($q, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function loginRequired($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }

}])


// satellizer

.config(function($authProvider) {

    // Optional: For client-side use (Implicit Grant), set responseType to 'token'
    $authProvider.facebook({
      clientId: 'Facebook App ID',
      responseType: 'token'
    });

    $authProvider.github({
      clientId: '57c6b2d67e6e3cb24640',
      scope: ['user:email']
    });

    $authProvider.google({
      //clientId: 'Google Client ID'
      clientId: 'AIzaSyAr0dAxr4BRApJmv2ZmWPBUXIONja5-SH0'
    });

    // No additional setup required for Twitter

    $authProvider.oauth2({
      name: 'foursquare',
      url: '/auth/foursquare',
      clientId: 'Foursquare Client ID',
      redirectUri: window.location.origin,
      authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate',
    });

    $authProvider.baseUrl   = '';
    $authProvider.loginUrl  = 'auth/login';
    $authProvider.signupUrl = 'auth/signup';
    $authProvider.unlinkUrl = 'auth/unlink/';

})

//formly configuration
.config(function(formlyConfigProvider) {
    // set templates here
    formlyConfigProvider.setType({
      name: 'custom',
      templateUrl: 'templates/formly-custom-template.html'
    });
})

.run(function() {
  
  /*
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

  });
  */    

    // hide loading screen...
    console.log('hide loading screen...');
    //loading_screen.finish();
});