'use strict';

/* sigControllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')

.controller("sigLoginController", 
                    ['$scope', '$state', '$log', 'sigService', '$ionicLoading', '$ionicPopup', 'Upload',
            function($scope,    $state,   $log,   sigService ,  $ionicLoading ,  $ionicPopup,   Upload) {

                $log.debug("sigLogin ...");


                $scope.loginFacebook = function(){
                    console.log('loginFaceBook............');
                    var userDataTest = {
                                            'userName': 'mario',
                                            'email': 'a@a.com' 
                                        };

                    sigService.setUserData(userDataTest);

                    $state.go('menu.map');

                }

}])

.controller("sigPhotoController", 
                    ['$scope', '$state', '$log', 'sigService', '$ionicLoading', '$ionicPopup', 'Upload',
            function($scope,    $state,   $log,   sigService ,  $ionicLoading ,  $ionicPopup,   Upload) {

               
        $log.debug("sigPhoto  start");
        $scope.imageSrc = 'images/park.jpg';
        $scope.singleModel = 1;
          
        $scope.selectImageFile = function(){
              console.log('selectImageFile............');
              //$ionicLoading.show({template: 'Attendere...' });
              document.getElementById("idImageFileInput").click();
        }

        $scope.nextStep = function(){
              console.log('nextStep............');
              $state.go('sigPosition');
        }

        $scope.testService = function(){
            console.log('testService............');
            sigService.setAddress('Via AAAAAAAA');
            console.log(sigService.getFileList());
                $ionicLoading.show({template: 'Invio segnalazione in corso...'});
                    Upload.upload({
                        url: 'http://localhost:9988/uploadmgr/upload',
                        method: 'POST',
                        //files: vm.options.data.fileList
                        data: {files : sigService.getFileList(), fields: { 
                                                                                position : 'asdasdasd' 
                                                                            
                                                                       } }
                    }).then(function (resp) {
                        $ionicLoading.hide();
                        console.log('Success ');
                            var alertPopup = $ionicPopup.alert({
                                title: 'Segnalazione',
                                template: 'Richiesta inviata!. Grazie.'
                        });
                        alertPopup.then(function(res) {
                            $log.debug('Quit popup');
                        });
                    }, function (resp) {
                        $ionicLoading.hide();
                        console.log('Error status: ' + resp.status);
                    }, function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ');
                        /*
                        if (progressPercentage < 100) {
                        _progress = progressPercentage
                        $rootScope.$broadcast('dialogs.wait.progress',{'progress' : _progress});
                        }else{
                        $rootScope.$broadcast('dialogs.wait.complete');
                        }
                        */
                    });


        }
        
/*

       $scope.getFile = function () {
         $scope.progress = 0;
         console.log('getFile');
            
            sigService.fileReader.readAsDataUrl($scope.file, $scope)
                      .then(function(result) {
                          $scope.imageSrc = result;
                          $ionicLoading.hide();
                      }, function(err) {
                          $ionicLoading.hide();
                          console.log(err);
                      }
                      );
        };
*/      
       
        $scope.addImagesOnChange = function(files, errFiles) {
            console.log('addImagesOnChange ...');
            console.log(event.target.files);
            sigService.setAddress('sdfsdfs');
            $ionicLoading.show({template: 'Attendere...' });
            if (event.target.files.length > 0) {

                var files = event.target.files;
                console.log(files[0]);
                //$ionicLoading.show({template: 'Attendere...' });
                
                sigService.addNewFile(files[0]);

                sigService.readAsDataURL(files[0], $scope)
                        .then(function(result) {
                            console.log()
                            $scope.imageSrc = result;
                            //sigService.setImgBase64(result);
                            $ionicLoading.hide();
                        },function(err) {
                            $ionicLoading.hide();
                            console.log(err);
                        });
             } else {
                $ionicLoading.hide();

                var alertPopup = $ionicPopup.alert({
                    title: 'Attenzione',
                    template: 'Nessuna immagine selezionata'
                });
                    alertPopup.then(function(res) {
                    $log.debug('Quit popup');
                });

             }
                

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


.controller("sigPhotoControllerWebRTC", 
                    ['$scope', '$state', '$log', 'sigService', '$ionicActionSheet', '$ionicLoading', '$ionicPopup', 'qReaderService',
            function($scope,    $state,   $log,   sigService ,  $ionicActionSheet , $ionicLoading ,  $ionicPopup,   qReaderService) {

               
        $log.debug("sigPhoto  start");
        $scope.imageSrc = 'images/park.jpg';
        $scope.singleModel = 1;
        $scope.showVideo = true;
        $scope.showCanvas = false;
        $scope.showImage = false;


        qReaderService.init('#webcam');          

        $scope.scatta = function(){

            $scope.showVideo = false;
            qReaderService.shot('#webcam','#canvas','#canvasImg');
            $scope.showImage = true;
            sigService.setImgBase64(document.querySelector('#canvasImg').src);


            var hideSheet = $ionicActionSheet.show({
                                buttons: [
                                            { text: '<i class="icon ion-android-exit assertive"></i> <b>Si proseguo</b>' }
                                ],
                                //destructiveText: 'Delete',
                                titleText: '<b>Lo foto va bene ?</b>',
                                cancelText: '<i class="icon ion-android-exit assertive"></i> No scatto ancora',
                                destructiveText: (ionic.Platform.isAndroid() ? '<i class="icon ion-android-exit assertive"></i>Scatta ancora': null),
                                cancel: function() {
                                    console.log('reset');
                                    $scope.showVideo = true;
                                    $scope.showImage = false;   
                                },

                                destructiveButtonClicked: function(index) {
                                    console.log('reset');
                                    $scope.showVideo = true;
                                    $scope.showImage = false;                                    
                                    return true;
                                },

                                buttonClicked: function(index) {
                                    console.log(index);
                                    $state.go('menu.type');
                                    return true;
                                }
            });

        }

        $scope.restartCamera = function() {
            $scope.showImage = false;
            $scope.showVideo = true;
        }

        $scope.nextStep = function(){
              console.log('nextStep............');
              $state.go('menu.type');
        }
    
}])

.controller("sigIntro", 
                    ['$scope', '$state', '$log', '$ionicLoading', '$ionicPopup', '$ionicSlideBoxDelegate',
            function( $scope,    $state,   $log,   $ionicLoading ,  $ionicPopup,  $ionicSlideBoxDelegate) {

               
        $log.debug("sigIntro  start");


        $scope.startApp = function() {
            $state.go('menu.profile');
        };
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };

        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };

        $scope.nextStep = function(){
              console.log('nextStep............');
              $state.go('menu.type');
        }
    
}])


/*

.controller('sigLocationController', 
                    ['$scope', '$state', '$log', 'sigService', '$ionicLoading', '$ionicPopup',
            function($scope,    $state,   $log,   sigService ,  $ionicLoading,   $ionicPopup ) {
                
    $log.debug('sigPosition...');

        $scope.addresses = [];
        $scope.location = '';
        var gpsOptions = {
            enableHighAccuracy: true,
            timeout: 10000
        };


        $scope.nextStep = function(){
              console.log('nextStep............');
              $state.go('sigType');
        }

        $scope.getLocationGPS = function(params) {
            console.log('getPositionGPS............');


            var alertPopup = $ionicPopup.alert({
                   title: 'Informazione',
                subTitle: 'Eseguire le seguenti operazioni!',
                template: 'Prima di procedere:<br/> 1 - Abilitare il GPS del telefono<br/>2 - Dopo avere premuto OK rispondere SI alla richiesta di accesso alla posizione mobile.'
            });

            alertPopup.then(function(res) {
                $log.debug('Quit popup');

                var waitMsg = '';
                if(gpsOptions.enableHighAccuracy){
                    waitMsg = waitMsg + "<br>Precisione ATTIVA ...";
                } else {
                    waitMsg = waitMsg + "<br>Precisione NON ATTIVA ...";
                }

                waitMsg = " Ricerca in corso (max " + gpsOptions.timeout / 1000 +   " secondi) " + waitMsg; 

                $ionicLoading.show({template: waitMsg});
                //enableHighAccuracy:true,maximumAge:30000,timeout:27000
                sigService.getCurrentPosition(gpsOptions).then(
                    
                    function(position) {
                        $scope.myPosition = position;
                        sigService.mapLocation(position).then(function(address) {
                            console.log(address);
                            $scope.addresses = address.data.results;
                            $scope.location = address.data.results[0].formatted_address;
                            $scope.$apply;
                            $ionicLoading.hide();
                        });
                    }, 

                    function(reason) {
                        console.log(reason);
                        $log.debug('Geo error');
                        $log.debug(reason);
                        $ionicLoading.hide();
                        var msg = '';

                        if (reason.error.code == 1 ){
                            msg = "E' stato negato l'accesso al rilevamento della geolocalizzazione! Andare in Impostazioni/Impostazioni Sito/Posizione e rimuovere dai Bloccati la seguente pagina poi fare Aggiorna e ritentare "
                        }

                        if (reason.error.code == 2 ){
                            gpsOptions.enableHighAccuracy = false;
                            msg = "Errore generico<br/>O il browser non supporta la ricerca mobile oppure riprova! (ho impostato una ricerca meno precisa)."
                        }
                        
                        if (reason.error.code == 3 ){
                            gpsOptions.timeout = gpsOptions.timeout + 10000; 
                            msg = "Errore di timeout <br/> Viene portato a " + gpsOptions.timeout + "  millisecondi il tempo di attesa"
                        }
                        
                        console.log(reason.error.code);
                        console.log(msg);

                        var alertPopup = $ionicPopup.alert({
                            title: 'Errore!',
                            template: msg
                        });
                            alertPopup.then(function(res) {
                            $log.debug('Quit popup');
                        });
                    }
                );
  
            }); // END ALERT

        } // END getLocationGPS

        $scope.testService = function(){
            console.log('testService............');
            sigService.setAddress('Via AAAAAAAA');
            sigService.getAddress('Via AAAAAAAA');
        }

    
}])

*/



// sigMap ---------------------------------------------------------------------------------------


.controller('sigMapLocationController', 
             [ '$window','$scope', '$state', '$compile','$location', '$ionicActionSheet', 'uiGmapGoogleMapApi', '$filter', 'Session', '$ionicModal','$ionicSideMenuDelegate','$ionicPopover', '$ionicPopup', '$ionicLoading', '$log', '$timeout', 'ENV','$interval', 'sigService',
     function(  $window,  $scope,   $state,   $compile,  $location,    $ionicActionSheet,  uiGmapGoogleMapApi ,  $filter,   Session,   $ionicModal,  $ionicSideMenuDelegate,    $ionicPopover,  $ionicPopup,  $ionicLoading,   $log,   $timeout,   ENV,  $interval,   sigService) {


         $scope.modalData = {};
         
         $scope.modalData.txtTitle = "Informazioni GPS";
         $scope.modalData.cssTitle = "bar-positive";
         $scope.modalData.cardTxt = ["Prima di premere PROCEDI assicurarsi di eseguire le seguenti azioni per una corretta localizzazione GPS",
                                     "1. Attivare il GPS",
                                     "2. Alla richiesta di accesso alla localizzazione, premere CONSENTI"];



      // gestione modal popup i filtri --------------------------------------------------
      //$ionicModal.fromTemplateUrl('templates/mapLocationModal.html', function(sortModal) {
      $ionicModal.fromTemplateUrl('mapLocationModalTemplate.html', function(sortModal) {
            $scope.sortModal = sortModal;

            uiGmapGoogleMapApi.then(function(maps) {
                $log.log('uiGmapGoogleMapApi then . ...');

                $scope.map = { center: { latitude: 44.0357100000, longitude: 12.5573200000 }, zoom: 18 };
                //$scope.getLocationGPS();
                $scope.modalData.btnClose = true;
                $scope.modalData.btnCloseTxt = 'PROCEDI';
                $scope.modalData.btnReload = false;
                $log.debug('show modal ... info');
                $scope.sortModal.show();
                //$scope.sortModal.show();
                //$scope.refreshMap();
            });

          },{
            scope: $scope,
            animation: 'none'
      });

      $scope.openSortModal = function() {
        $log.debug('sigMapLocationController: Sort Modal ...');    
        $scope.sortModal.show();
      };     

      $scope.closeSortModal = function() {
        $log.debug('sigMapLocationController: Close Modal ...');    
        $scope.sortModal.hide();
      };

      $scope.mapLocationModalClose= function() {
        $log.debug('sigMapLocationController: mapLocationModalClose ...');
        $log.debug($scope.filterCriteria); 
        $scope.sortModal.hide().then(function(){
            $scope.getLocationGPS();    
        });
      };

      $scope.mapLocationModalCloseReload = function() {
        $log.debug('sigMapLocationController: mapLocationModalCloseReload ...');
        $window.location.reload();
        /*
        $log.debug($scope.filterCriteria); 
        $scope.sortModal.hide().then(function(){
            $scope.getLocationGPS();    
        });
        */
      };      

       $scope.nextStep = function(){
              console.log('nextStep............');
              //$state.go('menu.photo');
              $state.go('menu.webrtc');
      }


      $scope.staticMarker = [];
      $scope.randomMarkers = [];
      $scope.refreshTime = $filter('date')( new Date(), "dd/MM/yyyy HH:mm"),

      $log.debug($scope.refreshTime);

      /*
      uiGmapGoogleMapApi.then(function(maps) {
        $log.log('uiGmapGoogleMapApi then . ...');

        $scope.map = { center: { latitude: 44.0357100000, longitude: 12.5573200000 }, zoom: 18 };
        //$scope.getLocationGPS();
        $scope.sortModal.show();
        //$scope.refreshMap();
      });
      */

      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
      };


    $scope.filterCriteria = {
        //pageNumber: 1,
        //count: 0,
        //limit: $scope.pageSize,
        numPosTracking: 10,
        soloPattuglie: true,
        infoTraffico: true,
        timeInterval: 10, // minuti di validità
        qDateUp: $filter('date')( new Date(2015, 6, 20), "yyyyMMdd"),
        qDateDw: $filter('date')( new Date(2015, 6, 20), "yyyyMMdd"),
        table : 'coord_' + $filter('date')(new Date(), "yyyyMM"),

        //start: 0,
        //sortDir: 'asc',
        //sortedBy: 'id',
        //id_utenti_selezione : Session.isAdmin ? 0 : Session.id_utenti,
        //mese_selezione : 0,
        //anno_selezione: 0
    };

    $scope.addresses = [];

    $scope.location = '';
    var gpsOptions = {
        enableHighAccuracy: true,
        timeout: 30000
    };



        $scope.getLocationGPS = function(params) {

            console.log('getPositionGPS............');

            /*
            var alertPopup = $ionicPopup.alert({
                   title: 'Informazione',
                subTitle: 'Eseguire le seguenti operazioni!',
                template: 'Prima di procedere:<br/> 1 - Abilitare il GPS del telefono<br/>2 - Dopo avere premuto OK rispondere SI alla richiesta di accesso alla posizione mobile.'
            });

            alertPopup.then(function(res) {
            */    
            

                //$log.debug('Quit popup');

                var waitMsg = '';
                if(gpsOptions.enableHighAccuracy){
                    waitMsg = waitMsg + "<br>Precisione ATTIVA ...";
                } else {
                    waitMsg = waitMsg + "<br>Precisione NON ATTIVA ...";
                }

                waitMsg = " Ricerca in corso (max " + gpsOptions.timeout / 1000 +   " secondi) " + waitMsg; 

                $ionicLoading.show({template: waitMsg});
                //enableHighAccuracy:true,maximumAge:30000,timeout:27000
                sigService.getCurrentPosition(gpsOptions).then(
                    
                    function(position) {
                        console.log(position);
                        sigService.setCurrentPosition(position);
                        $scope.myPosition = position;
                        $scope.map = { center: { latitude: position.coords.latitude, longitude: position.coords.longitude }, zoom: 18 };
                        $scope.randomMarkers = [
                            {
                                id: 1,
                                //icon: 'assets/images/blue_marker.png',
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                showWindow: false,
                                 options: {
                                            labelContent: '',
                                            labelAnchor: "22 0",
                                            labelClass: "marker-labels",
                                            draggable: false
                                        }
                            }
                        ];

                        $scope.$apply;
                        $ionicLoading.hide();

   
                        var hideSheet = $ionicActionSheet.show({
                                buttons: [
                                            { text: '<i class="icon ion-android-exit assertive"></i><b>Si proseguo</b>' }
                                ],
                                //destructiveText: 'Delete',
                                titleText: '<b>La posizione è corretta ?</b>',
                                cancelText: '<i class="icon ion-android-exit assertive"></i>No voglio riprovare',
                                destructiveText: (ionic.Platform.isAndroid() ? '<i class="icon ion-android-exit assertive"></i>Riprova GPS': null),
                                cancel: function() {
                                    console.log('reset');
                                },
                                destructiveButtonClicked: function(index) {
                                    console.log('reset');
                                    $scope.showVideo = true;
                                    $scope.showImage = false;                                    
                                    return true;
                                },

                                buttonClicked: function(index) {
                                    console.log(index);
                                    $state.go('menu.webrtc');
                                    return true;
                                }
                        });
                    }, 

                    function(reason) {
                        console.log(reason);
                        $log.debug('Geo error');
                        $log.debug(reason);
                        $ionicLoading.hide();
                        var msg = '';

                        $scope.modalData.btnClose = true;
                        $scope.modalData.btnCloseTxt = 'RIPROVA';
                        $scope.modalData.btnReload = false;
                        

                        if (reason.error.code == 1 ){
                            $scope.modalData.btnClose = false;
                            $scope.modalData.btnCloseTxt = '';
                            $scope.modalData.btnReload = true;
                            $scope.modalData.btnReloadTxt = 'OK riprova!';
                            $scope.modalData.cardTxt = ["E' stato NEGATO l'accesso al rilevamento della geolocalizzazione!",
                                     "Per CONSENTIRE l'accesso alla localizzazione (Google Chrome) andare sul menù IMPOSTAZIONI poi IMPOSTAZIONI SITO poi POSIZIONE. Dalla voce BLOCCATI selezionare https://pmlab.comune.rimini.it premere e confermare CANCELLA E REIMPOSTA poi tornare su questa pagina e premere OK riprova!", 
                                     "Successivamente SEGUIRE le indicazioni"];
                            msg = "E' stato negato l'accesso al rilevamento della geolocalizzazione! Andare in Impostazioni/Impostazioni Sito/Posizione selezionare https://pmlab.comune,rimini.it premere su CANCELLA E REIMPOSTA";
                        }

                        if (reason.error.code == 2 ){

                            $scope.modalData.btnClose = true;
                            $scope.modalData.btnCloseTxt = 'RIPROVA';
                            $scope.modalData.btnReload = false;
                            $scope.modalData.btnReloadTxt = '';


                            gpsOptions.enableHighAccuracy = false;
                            msg = "Errore generico. Il browser non supporta la ricerca mobile oppure riprova! (ho impostato una ricerca meno precisa).";                            
                            $scope.modalData.cardTxt = ["Attenzione, prima di premere PROCEDI assicurarsi di eseguire le seguenti azioni per una corretta localizzazione",
                                     msg,
                                     "timeout:" + gpsOptions.timeout + " enableHighAccuracy:" + gpsOptions.enableHighAccuracy,
                                     "Premere OK e Riprovare la localizzazione"];                            

                        }
                        
                        if (reason.error.code == 3 ){

                            $scope.modalData.btnClose = true;
                            $scope.modalData.btnCloseTxt = 'RIPROVA';
                            $scope.modalData.btnReload = false;
                            $scope.modalData.btnReloadTxt = '';

                            gpsOptions.timeout = gpsOptions.timeout + 10000; 
                            gpsOptions.enableHighAccuracy = false;
                            msg = "Errore di timeout: Viene portato a " + gpsOptions.timeout + "  millisecondi il tempo di attesa"
                            $scope.modalData.cardTxt = ["Attenzione, prima di premere PROCEDI assicurarsi di eseguire le seguenti azioni per una corretta localizzazione",
                                     msg,
                                     "timeout:" + gpsOptions.timeout + " enableHighAccuracy:" + gpsOptions.enableHighAccuracy,
                                     "Premere OK e Riprovare la localizzazione"];                            
                        }
                        
                        console.log(reason.error.code);
                        console.log(msg);


                        $scope.modalData.txtTitle = "ATTENZIONE";
                        $scope.modalData.cssTitle = "bar-assertive";
                  

                        $log.debug('show modal ... error');        
                        $scope.openSortModal();

                    }
                );
  
            /* }); // END ALERT POPUP*/

        } // END getLocationGPS
  

  $log.debug('define .. $interval(function() {}, 10);');


   $scope.refreshMapFAKE = function () {
            $log.log('refreshMap ...');
            $ionicLoading.show({template: 'Aggiornamento dati'});
    };

}])

// sigType ------------------------------------------------------------------------------------
.controller('sigTypeController', 
                   [ '$scope', '$state','$rootScope', '$log', 'sigService', '$ionicLoading', '$ionicPopup', 'Upload',
            function ($scope,   $state , $rootScope,   $log,   sigService ,  $ionicLoading,   $ionicPopup,   Upload  ) {

    $log.debug('sigType...');

    $scope.typeList = [
        { text: "Tipo1", checked: false },
        { text: "Tipo2", checked: false },
        { text: "Tipo3", checked: false },
        { text: "Tipo4", checked: false }
    ];


    $scope.send2profile = function (){
         $state.go('menu.login');
    };

    $scope.sigSendData = function(){
            $log.debug('sigSendData...');
            var posObj = sigService.getCurrentSavedPosition();
            //var myTypedList = _.filter($scope.typeList, function(o) { return o.checked; });
            //console.log(myTypedList);
            console.log(posObj); 
            console.log($scope.typeList); 
            

            var doc2 = _.filter($scope.typeList, function(o) { 	return o.checked; });
            var typeObj = _.flatMap(doc2, function(o) {	return { "type" : o.text };	});
            console.log(typeObj);


            var userDataObj = sigService.getUserData();
            console.log(userDataObj);

            console.log($rootScope.base_url);
            $ionicLoading.show({template: 'Invio segnalazione'});
                    Upload.upload({
                        url: $rootScope.base_url + '/segnalazioni/upload',
                        //url: '/segnalazioni/upload',
                        method: 'POST',
                        //files: vm.options.data.fileList
                        data: {files : sigService.getFileList(), fields: { 
                                                                   userData : userDataObj.sub,
                                                                   image64 : sigService.getImgBase64(),
                                                                   position : { 
                                                                                   latitude : posObj.coords.latitude,
                                                                                   longitude : posObj.coords.longitude
                                                                               },
                                                                    typeList : typeObj                                                                                
                                                                    //typeList : JSON.stringify($scope.typeList)
                                                                 } 
                             }
                    }).then(function (resp) {
                        $ionicLoading.hide();
                        console.log(resp);
                        console.log('Success ');
                            var alertPopup = $ionicPopup.alert({
                                title: 'Segnalazione',
                                template: 'Richiesta inviata!. Grazie. Ritorno alla pagina del profilo.'
                        });
                        alertPopup.then(function(res) {
                            $log.debug('Quit popup');
                            $state.go('menu.profile');
                        });
                    }, function (resp) {
                        $ionicLoading.hide();
                         console.log('Error');
                            var alertPopup = $ionicPopup.alert({
                                title: 'Errore',
                                template: resp.status
                        });
                        alertPopup.then(function(res) {
                            $log.debug(resp.status);
                        });

                        console.log('Error status: ' + resp.status);
                    }, function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ');
                        $ionicLoading.show({template: 'Invio ... (' + progressPercentage + '%)' });
                        /*
                            if (progressPercentage < 100) {
                            _progress = progressPercentage
                            $rootScope.$broadcast('dialogs.wait.progress',{'progress' : _progress});
                            }else{
                            $rootScope.$broadcast('dialogs.wait.complete');
                            }
                        */
                    });
    }
    
}]);