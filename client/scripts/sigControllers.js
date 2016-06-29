'use strict';

/* sigControllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')

.controller("sigPhotoController", 
                    ['$scope', 'dialogs', '$state', '$log', 'sigService',
            function($scope,    dialogs,   $state,   $log,   sigService) {

                
        $log.debug("sigPhoto  start");
        $scope.imagSrc = '';
          
        $scope.selectImageFile = function(){
              console.log('selectImageFile............');
              document.getElementById("idImageFileInput").click();
        }

        $scope.nextStep = function(){
              console.log('nextStep............');
              $state.go('sigPosition');
        }

        $scope.testService = function(){
            console.log('testService............');
            sigService.setAddress('Via AAAAAAAA');
            sigService.getAddress('Via AAAAAAAA');
        }
        
       $scope.getFile = function () {
         $scope.progress = 0;
         console.log('getFile');
            sigService.fileReader.readAsDataUrl($scope.file, $scope)
                      .then(function(result) {
                          $scope.imageSrc = result;
                      });
        };
 
        $scope.$on("fileProgress", function(e, progress) {
            $scope.progress = progress.loaded / progress.total;
        });
       
        $scope.addImagesOnChange = function(files, errFiles) {
            console.log('addImagesOnChange ...');
            var files = event.target.files;
            console.log(files[0]);

            //sigService.addNewFile(files[0]);
            sigService.readAsDataURL(files[0], $scope)
                      .then(function(result) {
                          $scope.imageSrc = result;
                      });

            /*
            var fileInfo = [];
            var i = 0;
            for(i=0;i<files.length;i++){
              console.log('adding file ..', files[i].name);
              sigService.addNewFile(files[i]);
            }
            */
      }
 
    
}])

.controller('sigPositionController', 
                    ['$scope', 'dialogs', '$state', '$log', 'sigService',
            function($scope,    dialogs,   $state,   $log,   sigService) {
                
    $log.debug('sigPosition...');

        $scope.addresses = [];

        function isGeolocationSupported() {
            return 'geolocation' in $window.navigator;
        }


        $scope.nextStep = function(){
              console.log('nextStep............');
              $state.go('sigType');
        }


        $scope.getLocationGPS = function(params) {
            console.log('getPositionGPS............');
            sigService.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000
         }).then(function(position) {
            $scope.myPosition = position;
            sigService.mapLocation(position).then(function(address) {
                console.log(address);
                $scope.addresses = address.data.results;
                $scope.$apply;
            });

         });

        }

        $scope.testService = function(){
            console.log('testService............');
            sigService.setAddress('Via AAAAAAAA');
            sigService.getAddress('Via AAAAAAAA');
        }

    
}])

// sigType ------------------------------------------------------------------------------------
.controller('sigTypeController', 
            [ '$scope',  '$log',
            function ($scope,  $log ) {
    $log.debug('sigType...');
           
                
    
}])

// sigSend ------------------------------------------------------------------------------------
.controller('sigSendController', 
            [ '$scope', '$log', 'sigService',
            function ($scope, $log, sigService ) {
    $log.debug('sigSend...');
    
}]);
