angular.module('myApp.services')
  .factory('FormlyService', function($http) {
    return {
      getFormly: function() {
        return $http.get('/api/s/me');
      },
      updateFormly: function(data) {
        return $http.put('/api/seq/me', data);
      },
      createFormly: function(data) {
        return $http.post('/api/seq/create', data);
      }
    };
  });