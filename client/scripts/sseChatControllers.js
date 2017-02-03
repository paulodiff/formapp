'use strict';

/* Controllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')


// SFormlyCtrl ---------------------------------------------------------------------------------
.controller('sseChatController', 
          ['$rootScope','$scope', '$state', '$location', 'Session', '$log', '$timeout','ENV','$q','$http', 'usSpinnerService','dialogs','UtilsService', 'Upload', '$anchorScroll', 'EventSourceSse', 
   function($rootScope,  $scope,   $state,   $location,   Session,   $log,   $timeout,  ENV,  $q,  $http,   usSpinnerService,  dialogs,  UtilsService,   Upload,   $anchorScroll,   EventSourceSse) {
    
  $log.debug('sseChatController>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');                                 

    var vm = this;
    var unique = 1;
    var _progress = 0;
  
    vm.sseMessages = [];

  $scope.listOfChannels = [{
                            id: 1,
                            label: 'Channel1',
                            subItem: { name: 'aSubItem' }
                        }, 
                        {
                            id: 2,
                            label: 'Channel2',
                            subItem: { name: 'bSubItem' }
                        }, 
                        {
                            id: 3,
                            label: 'Channel3',
                            subItem: { name: 'bSubItem' }
                        }
                        ];

  $scope.sseUserId = UtilsService.getRandomId();


 /*
  console.log('>loginOrSignup');
  // viene creato un utente con un Id dato dal server {Id, $promise}
  $scope.user = sseUsers.loginOrSignup();
  console.log('>user', $scope.user);

  $scope.user.$promise.then(function() {
     console.log('user:promise:...', $scope.user.id);
     $scope.chats = sseChats.forRoom("demo", $scope.user.id);
  });

  $scope.sendChat = function() {

    $scope.chats.send($scope.newChat)
      .then(resetChat, resetChat);
  }

  // controlla se la chat è dell'utente
  $scope.isMine = function(chat) {
    return chat.userId === $scope.user.id;
  }

  function resetChat() {
    $scope.newChat = {};
  }
  */

  function sseConnect() {
        console.log('sseConnect');
        var id = $scope.sseUserId;
        var chatEvents = new EventSourceSse($rootScope.base_url + '/sse/connect/' + id  + "/events");
        chatEvents.addEventListener('chat', function(event) {
            console.log(event);
        });

        chatEvents.addEventListener('message', function(e) {
            vm.sseMessages.push(e.data);
            console.log(e);
        });

        chatEvents.addEventListener('open', function(e) {
            console.log(e);
        });

  }

  function  sseSubscribe(){
      console.log('sseSubscribe');
  }

  function  sseUnsubscribe(){
      console.log('sseUnsubscribe');

  }

  function sseSendData(){
      console.log('sseSendData');

     $http.get( $rootScope.base_url + '/sse/broadcast')
        .then(function() {
          console.log('test!');
        }, function() {
          console.log('test! - error');
        });
  }


  function sseTest(){
      console.log('sseTest');

      $http.get($rootScope.base_url + '/sse/test')
        .then(function(data) {
          console.log(data);
        }, function() {
          console.log('test! - error');
        });
  }

  var vm = this;
  vm.sseConnect = sseConnect;
  vm.sseSendData = sseSendData;
  vm.sseSubscribe = sseSubscribe;
  vm.sseUnsubscribe = sseUnsubscribe;
  vm.sseTest = sseTest;

                                 
}]);


