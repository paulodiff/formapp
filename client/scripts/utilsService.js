angular.module('myApp.services')
  .factory('UtilsService', function($http) {
    return {
      getTimestampPlusRandom: function() {

          // Create a date object with the current time
          var now = new Date();
          var date = [ now.getDate(), now.getMonth() + 1, now.getFullYear() ];
          var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
          var suffix = ( time[0] < 12 ) ? "AM" : "PM";
          time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
          time[0] = time[0] || 12;

          // If seconds and minutes are less than 10, add a zero
            for ( var i = 1; i < 3; i++ ) {
              if ( time[i] < 10 ) {
                time[i] = "0" + time[i];
              }
            }

          // Return the formatted string
          return date.join("") + "@" + time.join("") + "@" + suffix;
        },

      updateProfile: function(profileData) {
        return $http.put('/api/s/me', profileData);
      }
    };
  });