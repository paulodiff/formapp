'use strict';

/* Controllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')


// ListSegnalazioniSosteController ---------------------------------------------------------------------------------
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
.controller('ListSegnalazioniSosteController', 
            ['$rootScope','$scope', '$http', '$state', '$location', '$filter', 'Session', '$ionicModal','$ionicSideMenuDelegate','$ionicPopover', '$ionicPopup', '$ionicLoading', '$log', '$timeout','ENV',
     function($rootScope,  $scope,   $http ,  $state,   $location,  $filter, Session, $ionicModal,   $ionicSideMenuDelegate,    $ionicPopover,  $ionicPopup,    $ionicLoading,   $log,   $timeout, ENV) {
    
  $log.debug('ListSegnalazioniSosteController>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');                                 
  
  $scope.totalPages = 0;
  $scope.itemsCount = 0;
  $scope.currentPage = 1; 
  $scope.currentItemDetail = null;
  $scope.totalItems = 0;
  $scope.pageSize = 15; // impostato al massimo numero di elementi
  $scope.startPage = 0;         
  $scope.openedPopupDate = false;    
  $scope.utentiList = [];
  $scope.id_utenti_selezione = 0;        
  $scope.items = [];
  $scope.moreDataCanBeLoaded = true;
  
  // gestione modal popup slide per i filtri --------------------------------------------------
  $ionicModal.fromTemplateUrl('templates/sortModal.html', 
        function(sortModal) {
            $scope.sortModal = sortModal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
           
  $ionicModal.fromTemplateUrl('templates/detailModal.html', 
        function(detailModal) {
            $scope.detailModal = detailModal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
                                 
                                 
                                 
  $scope.openSortModal = function() {
        $log.debug('ListSegnalazioniController Sort Modal ...');    
        $scope.sortModal.show();
  };
                                 
  $scope.openDetailModal = function(item) {
        $log.debug('ListSegnalazioniController Detail Modal ... :');    
        $log.debug(item);
        item.data_servizi = $filter('date')(item.data_servizi, "dd/MM/yyyy"); 
        item.a_ora_servizi = item.a_ora_servizi.substr(11,5);
        item.da_ora_servizi = item.da_ora_servizi.substr(11,5);
        $scope.currentItemDetail = item;
        $scope.detailModal.show();
  };
                                 
                                 
  $scope.closeSortModal = function() {$scope.sortModal.hide();};
  $scope.closeDetailModal = function() {$scope.detailModal.hide();};
                                 
  $scope.saveSort = function() {
    $log.debug("ListSegnalazioniController: SORT MODAL " + this.filterTerm + " sort " + this.sortBy + ' id_selezione :' + this.id_utenti_selezione);
    $scope.filterCriteria.id_utenti_selezione = this.id_utenti_selezione;
    $log.debug($scope.filterCriteria);
    $scope.filterTerm = this.filterTerm;
    $scope.sortBy = this.sortBy;
    $scope.sortModal.hide();
    $scope.fetchResult();
  }
  
  $scope.OpenFilter = function() {
       $log.debug("ListSegnalazioniController: OpenFilter .. sortModal.show()");
       $scope.sortModal.show();
  };                                 
                               
  
  // inzializza la data di filtro   
  $log.debug('Init dateFilter');    
  $scope.frmData = {};     
  $scope.frmData.dateFilter = new Date();

  // nei test setto una data opportuna
  if (ENV.name == 'developement') {
    //$scope.frmData.dateFilter = new Date(2015, 6, 20);
  }

  $scope.frmData.auto1 = 'asdasd';
  $log.debug($scope.frmData.dateFilter);


  $scope.dateChanged = function(){
    $log.debug('Date changed!');
    //$log.debug($scope);
    $log.debug($scope.frmData.dateFilter);
    $log.debug($filter('date')($scope.frmData.dateFilter, "yyyyMMdd"));
  };

  //default criteria that will be sent to the server

  $scope.filterCriteria = {
    //pageNumber: 1,
    //count: 0,
    //limit: $scope.pageSize,
    qDate: $filter('date')($scope.frmData.dateFilter, "yyyyMMdd"),
    //start: 0,
    //sortDir: 'asc',
    //sortedBy: 'id',
    //id_utenti_selezione : Session.isAdmin ? 0 : Session.id_utenti,
    //mese_selezione : 0,
    //anno_selezione: 0
  };
    
  $log.debug('ListSegnalazioniController SERVIZI INIT filterCriteria');
  $log.debug($scope.filterCriteria);
    
  $scope.loadMore = function () {
    //$scope.currentPage = 1;
    //$scope.pageSize = 5; // impostato al massimo numero di elementi 
    $scope.currentItemDetail = null;
    $scope.totalItems = 0;
    $scope.startPage = 0;         
    console.log('loadMore');
    console.log('currentPage:' + $scope.currentPage);
    console.log('pageSize:' + $scope.pageSize);
      $http({
        method: 'GET',
        url: $rootScope.base_url + '/segnalazioni/getList',
        //url: '/segnalazioni/getList',
        params: {
            currentPage: $scope.currentPage,
            pageSize : $scope.pageSize 
            }
        }).then(function successCallback(response) {
            console.log(response);
            //$scope.items = response.data;
            console.log(response.data.length);
            if (response.data.length == 0){
                $scope.moreDataCanBeLoaded = false;
            }

            var fast_array = [];
            response.data.forEach(function (idata) {
                var obj = {
                    "id" : idata._id,
                    "img" : 'segnalazioni/getImage?id=' + idata._id,
                    "ts" : idata.ts
                }
                fast_array.push(obj);
                console.log(obj);
            });
            
            $scope.items = $scope.items.concat(fast_array);
            //$scope.items = $scope.items.concat(response.data);
        }, function errorCallback(response) {
            console.log(response);        
        });
        $scope.currentPage = $scope.currentPage + 1;
        $scope.$broadcast('scroll.infiniteScrollComplete');
  }


  $scope.fetchResult = function () {
      $log.debug('SegnalazioniSosteController: fetchResult');
      $http({
        method: 'GET',
        url: $rootScope.base_url + '/getList',
        }).then(function successCallback(response) {
            console.log(response.data);

            var fast_array = [];
            data.forEach(function (idata) {
                var obj = {
                    "id" : idata._id,
                    "img" : 'segnalazioni/getImage?id=' + idata._id 
                }
                fast_array.push(obj);
                console.log(obj);
            });
            
            $scope.items = $scope.items.concat(fast_array);
        }, function errorCallback(response) {
            console.log(response);        });
  }


  /*

 
  //The function that is responsible of fetching the result from the server and setting the grid to the new result
  $scope.fetchResult = function () {
      $log.debug('ListSegnalazioniController: fetchResult');
      $log.debug('ListSegnalazioniController: impostazione criteri di filtro');

      var offset_page =  ( $scope.currentPage - 1 ) * $scope.pageSize;
      //$scope.filterCriteria.start = offset_page;
      $scope.filterCriteria.qDate =$filter('date')($scope.frmData.dateFilter, "yyyyMMdd");
      $log.debug($scope.filterCriteria);
      $log.debug('ListSegnalazioniController...fetchResult - GET Count');
    

      var serviziList = Restangular.all('getSegnalazioni');
      
      // Get items ...  
      $log.debug('ListSegnalazioniController...fetchResult - GET data');
      //$scope.filterCriteria.count = 0; // imposta la selezione standard sul server
      $ionicLoading.show({template: 'Dati in arrivo!' });
      return serviziList.getList($scope.filterCriteria).then(function(data) {
                //$log.debug(data);
          
                var fast_array = [];
          
                //loop per modificare e preparare i dati in arrivo

                //$log.debug('ListSegnalazioniController .. preparing data...');
                //data.forEach(function (idata) {
                    //$log.debug(idata);
                    //$scope.items.push(idata);
                    //if(idata.annullato_servizi == 1) idata.image_class="icon ion-close-circled assertive";
                    //if((idata.id_rapporto_valido_servizio != null) && (idata.annullato_servizi == 0)) idata.image_class="icon ion-share balanced";
                    //if((idata.id_rapporto_valido_servizio == null) && (idata.annullato_servizi == 0)) idata.image_class="icon ion-checkmark balanced";
                    
                    
                //});
                
                //$log.debug(fast_array);
          
                $scope.items = data;
                //$scope.items = fast_array;
            
                $log.debug(' .. data loaded!');
                $ionicLoading.hide();  
              
          // in caso di errore azzera la lista...      
          }, function (error) {
                $scope.items = [];
                $log.debug(error);
                $ionicLoading.hide();

                if (error.status == 403) {
                    //event.preventDefault();    
                    $rootScope.$broadcast(ENV.AUTH_EVENTS.notAuthenticated);
                }
      });
          
          
 };
 */
      
  //called when navigate to another page in the pagination
  $scope.selectPage = function () {
    var page = $scope.currentPage;
    $log.debug('ListSegnalazioniController: SELECT PAGE ...');  
    $log.debug('ListSegnalazioniController: Page changed to: ' + $scope.currentPage);  
    $log.debug('ListSegnalazioniController...selectPage:' + page);
    $scope.currentPage = page;
    //$scope.filterCriteria.pageNumber = page;
    $scope.fetchResult();
  };
                  
  //manually select a page to trigger an ajax request to populate the grid on page load
  $log.debug('ListSegnalazioniController : selectPage 1');
  
  //$scope.selectPage();
    
  // COLLECTION REPEAT TEST                               
  $scope.getItemHeight = function(item) {
    return item.isLetter ? 40 : 100;
  };
  $scope.getItemWidth = function(item) {
    return '100%';
  };                                 
                                 
                         
  // action new relazione
  $scope.new_relazione_action = function($id) {
        $log.debug('Route to newRelazioni con id : ' + $id);
        $scope.detailModal.hide();
        $state.go('menu.newProtocollo', { id: $id });
  };

    // action goto relazione
  $scope.goto_relazione_action = function($id) {
        $log.debug('Route to editRelazioni con id : ' + $id);
        $scope.detailModal.hide();
        $state.go('menu.editProtocollo', { id: $id });
  };                                 
                                 
                                 
  // callback for ng-click 'editUser':
  $scope.editItem = function (itemId) {
        $log.debug('editItem : change state');
        $log.debug(itemId);
        $location.path('/menu/edit/' + itemId);
  };
    
    // callback for ng-click 'editUser':
  $scope.editItem = function (itemId) {
        $log.debug('viewItem : change state');
        $log.debug(itemId);
        $location.path('/menu/view/' + itemId);
  };    
                                 
    
  $scope.debug_action = function(item){
        $log.debug('DEBUG_ACTION');
        $log.debug($scope);
  };
                   

     // callback for ng-click 'editUser':
    $scope.newProtocollo = function () {
        $log.debug('newProtocollo ... ');
        var alertPopup = $ionicPopup.alert({
            title: 'TEST',
            template: 'Versione di prova - Nessuna modifica'
        });
            alertPopup.then(function(res) {
            $log.debug('Versione di prova - Nessuna modifica');
        });
        //$state.go('menu.newProtocollo');
    };
    

    $scope.newItemFromPopover = function () {
        $log.debug('newItemFromPopover ... ');
        $log.debug('/menu/newProtocollo');

        var alertPopup = $ionicPopup.alert({
            title: 'TEST',
            template: 'Versione di prova - Nessuna modifica'
        });
            alertPopup.then(function(res) {
            $log.debug('Versione di prova - Nessuna modifica');
        });


        //$scope.popover.remove();
        //$state.go('menu.newProtocollo');
    };
                        
    $scope.OpenFilterFromPopover = function() {
        $log.debug('OpenFilterFromPopover');
        var alertPopup = $ionicPopup.alert({
            title: 'TEST',
            template: 'Versione di prova - Nessuna modifica'
        });
            alertPopup.then(function(res) {
            $log.debug('Versione di prova - Nessuna modifica');
        });

        //$scope.popover.hide();
        //$scope.sortModal.show();
    };                                   
                                 
    $scope.refreshDati = function() {
        $log.debug('refreshDati .... ');
        $scope.currentPage =  1;
        $scope.items = [];
        $scope.loadMore();
        /* FAKE
        $log.debug($scope.frmData.dateFilter);
        $log.debug($scope);
        $ionicLoading.show({template: 'Aggiornamento dati ...'});
        $timeout(function () {

            $ionicLoading.hide();
            }, 2000);
        */
    };             




                          

    // template popover per funzioni aggiuntive
                                 
    var templatePopover = '<ion-popover-view>';
    //templatePopover +=    '<ion-header-bar><h1 class="title">Azioni possibili</h1></ion-header-bar>';                                          
    templatePopover +=    '<ion-content>';                                      
    templatePopover +=    '<div class="list">';
    templatePopover +=    '<a class="item item-icon-left" ng-click="newItemFromPopover()" ><i class="icon ion-plus-circled"></i> Nuovo elemento</a>';
    templatePopover +=    '<a class="item item-icon-left" ng-click="OpenFilterFromPopover()"><i class="icon ion-funnel"></i>Filtro</a>';
    templatePopover +=    '<a class="item item-icon-left" ng-click="refreshDati()"><i class="icon ion-funnel"></i>Ricarica</a>';
    //templatePopover +=    '<a class="item item-icon-left" ng-click="ShowItemDetailFromPopover()"><i class="icon ion-funnel"></i>Item</a>';
    //templatePopover +=    '<button class="button button-clear button-positive" ng-click="debug_action()">Chiudi</button>';
    templatePopover +=    '</div>';
    templatePopover +=    '</ion-content>';                                      
    templatePopover +=    '</ion-popover-view>';

    //<ion-nav-buttons side="right" >
    //<button class="button button-icon button-clear ion-plus-circled" ng-click="newRelazioni()"></button>
    //</ion-nav-buttons>
                                 
    //$log.debug(templatePopover);                                          
                             
    $scope.popover = $ionicPopover.fromTemplate(templatePopover,{ scope: $scope });                                     
                                          
    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });


    //console.log($location.path());
    $scope.loadMore();


                                 
}]);