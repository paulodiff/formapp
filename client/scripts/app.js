"use strict";
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('myApp', [//'ionic',
                         'ui.bootstrap',   
                         'ui.router',
                         'dialogs.main',
                         'ngResource',
                         //'ngCordova',
                         'angularSpinner',
                         'restangular',
                         'ngAnimate',
                         //'ngMockE2E',
                         'ngStorage',
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

    $stateProvider.state('login',{
            url: '/login',
            templateUrl: "templates/loginDashboard.html",
            controller:'LoginController',
            accessLogged: false,
            accessLevel: 'free1' 
    });

    $stateProvider.state('signup',{
            url: '/signup',
            templateUrl: "templates/signupDashboard.html",
            controller:'LoginController',
            accessLogged: false,
            accessLevel: 'free1' 
    });

    $stateProvider.state('profile',{
            url: '/profile',
            templateUrl: "templates/profileDashboard.html",
            controller:'LoginController',
            accessLogged: false,
            accessLevel: 'free1' 
    });


/*
    $stateProvider.state('menu.login', {
            url: "/login",
            views: {
                'menuContent' :{
                    templateUrl: "templates/loginPRO.html",
                    controller: "LoginController"
                }
            },
            accessLogged: false 
    });
*/ 

   /*
    $stateProvider.state('menu.report',{
        url: '/report',
        views: {
                'menuContent' :{
                    templateUrl: "templates/reportM.html",
                    controller: "ReportCtrlMobile"
                }
            },
        accessLogged: true, 
        configAction: 'new'
    });
    
    $stateProvider.state('menu.list',{
        url: '/list',
        views: {
                'menuContent' :{
                    templateUrl: "templates/ListItemM.html",
                    controller: "InfiniteCtrl"
                }
            },
        accessLogged: true, 
        configAction: 'new'
    });
    
    $stateProvider.state('menu.new',{
        url: '/new',
        
        views: {
            'menuContent' :{
                templateUrl: "templates/EditItemM.html",
                controller: "EditItemCtrl"
            }
        },
        
        accessLogged: true, 
        configAction: 'new'
    });

    $stateProvider.state('menu.edit',{
        url: '/edit/:id',
        views: {
                'menuContent' :{
                    templateUrl: "templates/EditItemM.html",
                    controller: "EditItemCtrl"
                }
            },
        accessLogged: true, 
        configAction: 'edit'
    });
    
    
    $stateProvider.state('menu.view',{
        url: '/view/:id',
        views: {
                'menuContent' :{
                    templateUrl: 'templates/EditItemM.html', 
                    controller: 'EditItemCtrl', 
                }
            },
        accessLogged: true, 
        configAction: 'view'
    });
*/
    // protocolli

/*
    $stateProvider.state('menu.listProtocolli',{
        url: '/listProtocolli',
         views: {
                'menuContent' :{
                    templateUrl: "templates/ListProtocolliM.html",
                    controller: "ListProtocolliController"
                }
            },
        accessLogged: true, 
        configAction: 'view'
    });   

    $stateProvider.state('menu.newProtocollo',{
        url: '/newProtocollo',
        
        views: {
                'menuContent' :{
                    templateUrl: "templates/EditItemProtocolloM.html",
                    controller: "EditItemProtocolloController"
                }
            },
        
        accessLogged: true, 
        configAction: 'new'
  });

*/
/*
    $stateProvider.state('menu.listSegnalazioni',{
        url: '/listSegnalazioni',
         views: {
                'menuContent' :{
                    templateUrl: "templates/ListSegnalazioniM.html",
                    controller: "ListSegnalazioniController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
    });   

    $stateProvider.state('menu.listBrogliaccio',{
        url: '/listBrogliaccio',
         views: {
                'menuContent' :{
                    templateUrl: "templates/ListBrogliaccioM.html",
                    controller: "ListBrogliaccioController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
    });   


    $stateProvider.state('menu.listReport',{
        url: '/listReport',
         views: {
                'menuContent' :{
                    templateUrl: "templates/ListReportM.html",
                    controller: "ListReportController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
    });  
*/
/*    
    // rapporti
    
    $stateProvider.state('menu.listRelazioni',{
        url: '/listRelazioni',
        //templateUrl: 'templates/ListItemRelazioni.html', 
        //controller: 'InfiniteCtrlRelazioni', 
        views: {
                'menuContent' :{
                    templateUrl: "templates/ListItemRelazioniM.html",
                    controller: "InfiniteCtrlRelazioni"
                }
            },
        
        accessLogged: true, 
        configAction: 'new'
    });
    
    $stateProvider.state('menu.newRelazioni',{
        url: '/newRelazioni/:id',
        
        views: {
                'menuContent' :{
                    templateUrl: "templates/EditItemRelazioniM.html",
                    controller: "EditItemCtrlRelazioni"
                }
            },
        
        accessLogged: true, 
        configAction: 'new'
  });

  $stateProvider.state('menu.editRelazioni',{
        url: '/editRelazioni/:id',
         views: {
                'menuContent' :{
                    templateUrl: "templates/EditItemRelazioniM.html",
                    controller: "EditItemCtrlRelazioni"
                }
            },
        accessLogged: true, 
        configAction: 'edit'
  });

  $stateProvider.state('menu.viewRelazioni',{
        url: '/viewRelazioni/:id',
         views: {
                'menuContent' :{
                    templateUrl: "templates/EditItemRelazioniM.html",
                    controller: "EditItemCtrlRelazioni"
                }
            },
        accessLogged: true, 
        configAction: 'view'
  });    

    
  $stateProvider.state('menu.about',{
        url: '/about',
         views: {
                'menuContent' :{
                    templateUrl: "templates/aboutM.html",
                    controller: "AboutController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
  });  
    
*/ /*
  $stateProvider.state('menu.help',{
        url: '/help',
         views: {
                'menuContent' :{
                    templateUrl: "templates/helpM.html",
                    controller: "HelpController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
  });

 $stateProvider.state('menu.maps',{
        url: '/maps',
         views: {
                'menuContent' :{
                    templateUrl: "templates/mapsM.html",
                    controller: "MapsController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
  });

 $stateProvider.state('menu.heat',{
        url: '/heat',
         views: {
                'menuContent' :{
                    templateUrl: "templates/heatM.html",
                    controller: "HeatController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
  });


 $stateProvider.state('menu.velox',{
        url: '/velox',
         views: {
                'menuContent' :{
                    templateUrl: "templates/veloxM.html",
                    controller: "VeloxController"
                }
            },
        accessLogged: false, 
        configAction: 'view'
  });

*/
/*
 $stateProvider.state('menu.cordova',{
        url: '/cordova',
         views: {
                'menuContent' :{
                    templateUrl: "templates/playlists.html",
                    controller: "PlaylistsCtrl"
                }
            },
        accessLogged: false, 
        configAction: 'view'
  });


 $stateProvider.state('test',{
        url: '/test',
        templateUrl: 'templates/testM.html', 
        controller: 'TestController', 
        accessLogged: false, 
        configAction: 'view'
  });
*/
 // Preload templates FAKE
/*
 $stateProvider.state('fake1',{
        url: '/fake1',
        templateUrl: 'templates/fancy-select.html', 
        controller: 'TestController', 
        accessLogged: false, 
        configAction: 'view'
  });

 $stateProvider.state('fake2',{
        url: '/fake2',
        templateUrl: 'templates/fancy-select-items.html', 
        controller: 'TestController', 
        accessLogged: false, 
        configAction: 'view'
  });  
*/
  /*
  RestangularProvider.setBaseUrl('/apiQ');
  RestangularProvider.setDefaultRequestParams({ apiKey: '**********************' });
  RestangularProvider.setRestangularFields({id: '_id.$oid'});
  RestangularProvider.setRequestInterceptor(function(elem, operation, what) {
        if (operation === 'put') {
          elem._id = undefined;
          return elem;
        }
        return elem;
      });
  */
}])

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