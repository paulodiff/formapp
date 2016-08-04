'use strict';

/* sigService */

angular.module('myApp.services')
 

.service('qReaderService',  ['$http','$rootScope', '$window', '$q','$log', 
                function ($http,  $rootScope,   $window,   $q,  $log) {

var QRReader = {};
var active = false;
var webcam = null;
var canvas = null;
var ctx = null;
var decoder = null;


// First get ahold of getUserMedia, if present
var getUserMedia = ($window.navigator.getUserMedia ||
				    $window.navigator.webkitGetUserMedia ||
				    $window.navigator.mozGetUserMedia ||
				    $window.navigator.msGetUserMedia);

if ($window.navigator) console.log('$window.navigator');
if ($window.navigator.getUserMedia) console.log('$window.navigator.getUserMedia');
if ($window.navigator.webkitGetUserMedia) console.log('$window.navigator.webkitGetUserMedia');
if ($window.navigator.mozGetUserMedia) console.log('$window.navigator.mozGetUserMedia');
if ($window.navigator.msGetUserMedia) console.log('$window.navigator.msGetUserMedia');




  var FileList2Upload = [];
  var Address = {};
  var curPosition = {};
  var myArray = [];
  var imgBase64 = {};
  var userData = {};


var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

		// First get ahold of getUserMedia, if present
		var getUserMedia = ($window.navigator.getUserMedia ||
				            $window.navigator.webkitGetUserMedia ||
				            $window.navigator.mozGetUserMedia ||
				            $window.navigator.msGetUserMedia);

		// Some browsers just don't implement it - return a rejected promise with an error
		// to keep a consistent interface
		if(!getUserMedia) {
			return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
		}

		// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
		return new Promise(function(successCallback, errorCallback) {
            console.log('calling .. getUserData via promisifiedOldGUM');
			getUserMedia.call($window.navigator, constraints, successCallback, errorCallback);
		});

	}

	// Older browsers might not implement mediaDevices at all, so we set an empty object first
	if($window.navigator.mediaDevices === undefined) {
        console.log('Older browser');
		$window.navigator.mediaDevices = {};
	}

	// Some browsers partially implement mediaDevices. We can't just assign an object
	// with getUserMedia as it would overwrite existing properties.
	// Here, we will just add the getUserMedia property if it's missing.
	if($window.navigator.mediaDevices.getUserMedia === undefined) {
        console.log('promisifiedOldGUM')
		$window.navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
	}


/*
  $window.navigator.getUserMedia = $window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia
	|| $window.navigator.mozGetUserMedia || $window.navigator.msGetUserMedia
	|| $window.navigator.oGetUserMedia;

*/
 this.init = function (webcam_selector, baseurl) {

	//baseurl = typeof baseurl !== "undefined" ? baseurl : "";


	// Init Webcam + Canvas
	this.webcam = document.querySelector(webcam_selector);
	this.canvas = document.querySelector("canvas");
	this.ctx = this.canvas.getContext("2d");
    this.video = document.querySelector("video");
	var streaming = false;
	//this.decoder = new Worker(baseurl + "decoder.min.js");

	// Resize webcam according to input
	this.webcam.addEventListener("play", function (ev) {
        console.log('play event!');
         // console.log($window);
		if (!streaming) {
            console.log('setting canvas ... ');
			//document.querySelector("canvas").width = $window.innerWidth;
			//document.querySelector("canvas").height = $window.innerHeight;
     		//document.querySelector("canvas").width = $window.innerWidth;
			//document.querySelector("canvas").height = 200;

            //document.querySelector("video").width = $window.innerWidth;
			//document.querySelector("video").height = 200;
            
            console.log($window.innerWidth);
            console.log($window.innerHeight);

            //document.querySelector("canvas").width = 300;
			//document.querySelector("canvas").height = 100;

            //document.querySelector("video").width = 300;
			//document.querySelector("video").height = 100;

            console.log(document.querySelector("video").videoWidth);
            console.log(document.querySelector("video").videoHeight);


			streaming = true;
		}
	}, false);

	// Start capturing video only
	function startCapture(constraints) {
		// Start video capturing
        console.log('startCapture');
		$window.navigator.mediaDevices.getUserMedia(constraints)
			.then(function (stream) {
                console.log('... assign stream ... to video ...');
				//document.querySelector("video").srcObject = stream;
                if($window.navigator.mozGetUserMedia) console.log('$window.navigator.mozGetUserMedia');

                console.log(stream);

                    if(document.querySelector("video")) {
                        console.log('document.querySelector("video").srcObject = stream;');
                        document.querySelector("video").srcObject = stream;
                        //document.querySelector("video").mozSrcObject = stream;
                    } else {
                    if ($window.navigator.mozGetUserMedia) {
                        document.querySelector("video").mozSrcObject = stream;
                    } else {
                        var vendorURL = $window.URL || $window.webkitURL;
                        this.video.srcObject = vendorURL.createObjectURL(stream);
                    }

                }

                //this.video.srcObject = stream;
                document.querySelector("video").play();
			})
			.catch(function(err) {
                console.log(err);
				showErrorMsg();
			});
	}

	function showErrorMsg() {
		//document.querySelector('.custom-btn').style.display = "none"; //Hide scan button, if error
		//sendToastNotification('Unable to open the camera, provide permission to access the camera', 5000);
        console.error('Unable to open the camera, provide permission to access the camera');
	}

    // Firefox lets users choose their camera, so no need to search for an environment
	// facing camera
    console.log($window.navigator.userAgent);

	if ($window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
        console.log('start Capture .... ');
		startCapture({ video: true });
    } else {
        console.log('start Capture .... with options...');
		$window.navigator.mediaDevices.enumerateDevices()
			.then(function (devices) {
                    console.log(devices);
	    	    	var device = devices.filter(function(device) {
    	    	    var deviceLabel = device.label.split(',')[1];
					if (device.kind == "videoinput") {
                        console.log(device);
						return device;
					}
		    });
				if (device.length > 1) {
                    console.log('setup device 1');
					var constraints = {
						video: {
							mandatory: {
								sourceId: device[1].deviceId ? device[1].deviceId : null
							},
                            width: 380, 
                            height: 220,
                            facingMode: { exact: "environment" }
						},
						audio: false
					};

					startCapture(constraints);
				}
				else if (device.length) {
                    console.log('setup device 2');
					var constraints = {
						video: {
							mandatory: {
								sourceId: device[0].deviceId ? device[0].deviceId : null
							},
                            width: {exact: 200 }, height: {exact: 200},
                            facingMode: { exact: "environment" } 
						},
						audio: false
					};
                    console.log(constraints);
					startCapture(constraints);
				}
				else {
					startCapture({video:true});
				}
			})
			.catch(function (error) {
                console.error(error);
				showErrorMsg();
			});
	}

}



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



        this.shot = function(video_tag, canvas_tag, img_tag) {
            var video = document.querySelector(video_tag);
            var canvas = window.canvas = document.querySelector(canvas_tag);
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            var dataURL = canvas.toDataURL();      
            document.querySelector(img_tag).src = dataURL;
        }


/*
   // save canvas image as data url (png format by default)
      var dataURL = canvas.toDataURL();

      // set canvasImg image src to dataURL
      // so it can be saved as an image
      document.getElementById('canvasImg').src = dataURL;

*/


this.setUserData = function(u){
    console.log(u);
    this.userData = u;
}

this.getUserData =  function(){
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
