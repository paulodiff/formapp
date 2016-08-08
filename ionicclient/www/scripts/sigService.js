'use strict';

/* sigService */

angular.module('myApp.services')
 

.service('sigService',  ['$http','$rootScope', '$window', '$q','$log', 
                function ($http,  $rootScope,   $window,   $q,  $log) {

  var FileList2Upload = [];
  var Address = {};
  var curPosition = {};
  var myArray = [];
  var imgBase64 = {};
  var userData = {};

  
    this.onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };

    this.onError = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };

    this.onProgress = function(reader, scope) {
        return function (event) {
            /*
            console.log(event.loaded);
            scope.$broadcast("imageProgressLoading",
                {
                    total: event.total,
                    loaded: event.loaded
                });
            */
        };
    };

  this.getReader = function(deferred, scope) {
            console.log('getReader');
            var reader = new FileReader();
            reader.onload = this.onLoad(reader, deferred, scope);
            reader.onerror = this.onError(reader, deferred, scope);
            reader.onprogress = this.onProgress(reader, scope);
            return reader;
   };

    this.readAsDataURL = function(file, scope) {
            console.log('readAsDataURL');
            var deferred = $q.defer();
             
            var reader = this.getReader(deferred, scope);         
            reader.readAsDataURL(file);
             
            return deferred.promise;
        };


this.setUserData = function(u){
    console.log(u);
    this.userData = u;
}

this.getUserData =  function(){
    console.log(this.userData);
    return this.userData;
}

this.getUserInfo =  function(){
    console.log(this.userData);
    return this.userData;
}


  this.setAddress = function(a){
    console.log(a);
    this.Address = a;
  };

  this.getAddress = function(){
    console.log(this.Address);
    return this.Address;
  };


  this.setImgBase64 = function(a){
    this.imgBase64 = a;
  };

  this.getImgBase64 = function(){
    return this.imgBase64;
  };



  this.addNewFile = function(fileInfo){
    console.log('sigService addNewFile');
    console.log(fileInfo);
    //console.log(this.Address);
    //console.log(this.FileList2Upload);
    //console.log(this.myArray);
    //console.log(this.curPosition);

    //var arr1 = [];
    //arr1.push(fileInfo);
    this.FileList2Upload = [];
    this.FileList2Upload.push(fileInfo);
  };

  this.getFileList = function(){
      return this.FileList2Upload;
  }

  this.setFile = function name(f) {
    console.log('sigService setFile');
    console.log(f);
  };

  this.sayHello = function () {
    console.log('hello');
    return 'Hello';
  };

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

  this.mapLocation = function(position) {
        console.log('mapLocation');
        console.log(position);
     
        var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true";
        console.log(url);
        return $http.get(url);
        /*
        $http.get(url)
            .then(function(result) {
                var address = result.data.results[2].formatted_address;
                $scope.address = address;
        });
        */
        //return $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=rimini%20via%20n&sensor=false');
 }

  
  /* geoLocation */

  this.setCurrentPosition = function (pos) {
      console.log('setCurrentPosition');
      console.log(pos);
      this.curPosition = pos;
  }

  this.getCurrentSavedPosition = function (){
      console.log('getCurrentSavedPosition');
      console.log(this.curPosition);
      return this.curPosition;
  }

  this.geoLocationSupported = function(){
      return 'geolocation' in $window.navigator;
  }

  this.getCurrentPosition = function(options) {
      console.log(options);
      var deferred = $q.defer();
            if(this.geoLocationSupported()) {
                    $window.navigator.geolocation.getCurrentPosition(
                        function(position) {
                            $rootScope.$apply(function() {
                                //retVal.position.coords = position.coords;
                                //retVal.position.timestamp = position.timestamp;
                                console.log(position);
                                deferred.resolve(position);

                                // ERRORE PER TEST!
                                //deferred.reject({error: {
                                //    code: 3,
                                //    message: 'This web browser does not support HTML5 Geolocation'
                                //}});

                            });
                        },
                        function(error) {
                            console.log(error);
                            $rootScope.$apply(function() {
                                deferred.reject({error: error});
                            });
                        }, options);
                } else {
                    console.log('geo error');
                    deferred.reject({error: {
                        code: 2,
                        message: 'This web browser does not support HTML5 Geolocation'
                    }});
                }
                return deferred.promise;
  };

  return this;

}]);
