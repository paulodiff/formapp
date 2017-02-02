'use strict';

/* Controllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')


// SFormlyCtrl ---------------------------------------------------------------------------------
.controller('sseChatController', 
          ['$rootScope','$scope', '$state', '$location', 'Session', '$log', '$timeout','ENV','sseUsers','$q','$http','sseChats', 'usSpinnerService','dialogs','UtilsService', 'Upload', '$anchorScroll', 
   function($rootScope,  $scope,   $state,   $location,   Session,   $log,   $timeout,  ENV,  sseUsers,  $q,  $http,  sseChats,   usSpinnerService,  dialogs,  UtilsService,   Upload, $anchorScroll) {
    
  $log.debug('sseChatController>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');                                 


  

  $scope.listOfRooms = [{
  id: 1,
  label: 'aLabel',
  subItem: { name: 'aSubItem' }
}, {
  id: 2,
  label: 'bLabel',
  subItem: { name: 'bSubItem' }
}];

  console.log('loginOrSignup');
  $scope.user = sseUsers.loginOrSignup();

  $scope.user.$promise.then(function() {
     console.log('user:promise:...', $scope.user.id);
     $scope.chats = sseChats.forRoom("demo", $scope.user.id);
  });

  $scope.sendChat = function() {

    $scope.chats.send($scope.newChat)
      .then(resetChat, resetChat);
  }

  $scope.isMine = function(chat) {
    return chat.userId === $scope.user.id;
  }

  function resetChat() {
    $scope.newChat = {};
  }
                                 
}]);


