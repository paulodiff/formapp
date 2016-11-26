'use strict';

/* Controllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')


// SFormlyCtrl ---------------------------------------------------------------------------------
.controller('ProtocolloCtrl', 
          ['$rootScope','$scope', '$state', '$location', 'Session', '$log', '$timeout','ENV','formlyConfig','$q','$http','formlyValidationMessages', 'FormlyService','usSpinnerService','dialogs','UtilsService', 'Upload', 
   function($rootScope,  $scope,   $state,   $location,   Session,   $log,   $timeout,  ENV,  formlyConfig,  $q,  $http,  formlyValidationMessages,   FormlyService,  usSpinnerService,  dialogs,   UtilsService,  Upload) {
    
  $log.debug('ProtocolloCtrl>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');                                 


    // http://www.technofattie.com/2014/07/01/using-angular-forms-with-controller-as-syntax.html
    this.form = $scope.form;

    var vm = this;
    var unique = 1;
    var _progress = 0;

    var ElencoSoftware = [
      { "id": "IRIDE", "label":"IRIDE"  },
      { "id": "JIRIDE", "label":"JIRIDE"  },
      { "id": "FIRMA_DIGITALE",  "label":"FIRMA_DIGITALE" },
      { "id": "WORD_PROCESSOR",  "label":"WORD_PROCESSOR" },
      { "id": "VELOX_PM",  "label":"VELOX_PM" },
      { "id": "PDF_CREATOR",  "label":"PDF_CREATOR" },
      { "id": "ALTRO",  "label":"ALTRO" }
    ];


 // richiede la lista degli utenti IRIDE da Mysql
 function refreshUtenteIride(address, field) {
      var promise;
      if (!address) {
        promise = $q.when({data: {results: []}});
      } else {
        var params = {address: address, sensor: false};
        var endpoint = '/api/seq/user';
        promise = $http.get(endpoint, {params: params});
      }
      return promise.then(function(response) {
        //console.log(response);
        field.templateOptions.options = response.data.rows;
      });
  };



    
    /*  ---  */

    vm.id = 'form01';
    vm.showError = true;
    vm.name  = "NAME01";
    vm.email  = "a@a.com";
    vm.userForm = {};
    vm.model = {};
    vm.model.name = 'm_COCOCO';
    vm.model.email = 'm__a@a.com';
    vm.model.hash = [];


    // function assignment
    vm.onSubmit = onSubmit;
    vm.calcHash = calcHash;

    function calcHash(f){
        console.log('calcHash', f);

        if(f) {
            var dlg = dialogs.wait('Controllo...','calcolo codice di controllo',0);

            var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                    file = f,
                    chunkSize = 2097152,                           // read in chunks of 2MB
                    chunks = Math.ceil(file.size / chunkSize),
                    currentChunk = 0,
                    spark = new SparkMD5(),
                    running = false,
                    time,
                    uniqueId = 'chunk_' + (new Date().getTime()),
                    chunkId = null,
                    fileReader = new FileReader();

                fileReader.onload = function (e) {
                    if (currentChunk === 0) {
                        console.log('Read chunk number <strong id="' + uniqueId + '">' + (currentChunk + 1) + '</strong> of <strong>' + chunks + '</strong><br/>', 'info');
                    } else {
                        if (chunkId === null) {
                            chunkId = document.getElementById(uniqueId);
                        }
                        // chunkId.innerHTML = currentChunk + 1;
                        var progressPercentage = parseInt(100.0 * currentChunk / chunks);
                        console.log('progress: ' + progressPercentage + '% ');
                        //dialogs.wait('Controllo...','calcolo codice di controllo',{'progress' : progressPercentage});
                        $rootScope.$broadcast('dialogs.wait.progress',{'progress' : progressPercentage});
                        $scope.$apply();
                    }
                    spark.appendBinary(e.target.result);                 // append array buffer
                    currentChunk += 1;
                    if (currentChunk < chunks) {
                        loadNext();
                    } else {
                        running = false;
                        console.log('<strong>Finished loading!</strong><br/>', 'success');
                        console.log('<strong>Computed hash:</strong> ' + spark.end() + '<br/>', 'success'); // compute hash
                        console.log('<strong>Total time:</strong> ' + (new Date().getTime() - time) + 'ms<br/>', 'success');
                        $rootScope.$broadcast('dialogs.wait.complete');
                        vm.model.hash.push({ "name" : f.name, "hash" : spark.end() });
                    }
                };
                fileReader.onerror = function () {
                    running = false;
                    console.log('<strong>Oops, something went wrong.</strong>', 'error');
                };


                function loadNext() {
                    var start = currentChunk * chunkSize,
                        end = start + chunkSize >= file.size ? file.size : start + chunkSize;
                    fileReader.readAsBinaryString(blobSlice.call(file, start, end));
                }
                running = true;
                console.log('<p></p><strong>Starting incremental test (' + file.name + ')</strong><br/>', 'info');
                time = new Date().getTime();
                loadNext();
        } // check f
    }

    // vm.originalFields = angular.copy(vm.fields);

    // function definition
    function onSubmit() {
        console.log('onSubmit ...');
        console.log(vm.model);
        var uploadUrl = $rootScope.base_url + '/api/protocollo/upload';
        console.log(uploadUrl);

       if (vm.userForm.$valid) {
          // vm.options.updateInitialValue();
          //alert(JSON.stringify(vm.model), null, 2);
          //usSpinnerService.spin('spinner-1');

          var dlg = dialogs.wait(undefined,undefined,_progress);

          console.log('upload!!');
          
          var upFiles = [];
          upFiles.push(vm.model.picFile1);
          upFiles.push(vm.model.picFile2);
          
          

        Upload.upload({
            url: uploadUrl,
            method: 'POST',
            //files: vm.options.data.fileList
            data: {files : upFiles, fields: { formModel : vm.model } }
        }).then(function (resp) {
            console.log('Success ');
            console.log(resp);


               dialogs.notify('ok','Azione completata con successo!' + resp);
              //dialogs.error('500 - Errore server',response.data.message, response.status);
          
            //usSpinnerService.stop('spinner-1');
        }, function (resp) {
            console.log('Error status: ' + resp.status);
            dialogs.error('500 - Errore server',response.data.message, response.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ');
            if (progressPercentage < 100) {
              _progress = progressPercentage
              $rootScope.$broadcast('dialogs.wait.progress',{'msg' : progressPercentage, 'progress' : _progress});
            }else{
              $rootScope.$broadcast('dialogs.wait.complete');
            }
        });

    
          
        }
    }

    // spinner test control
    $scope.startSpin = function(){
        usSpinnerService.spin('spinner-1');
    }

    $scope.stopSpin = function(){
        usSpinnerService.stop('spinner-1');
    }

   

                                 
}]);


