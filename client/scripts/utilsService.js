angular.module('myApp.services')
  .factory('UtilsService', function($http) {
    return {
      getTimestampPlusRandom: function() {

          // Create a date object with the current time
          var d = new Date(),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

          if (month.length < 2) month = '0' + month;
          if (day.length < 2) day = '0' + day;
    
          var time = [ d.getHours(), d.getMinutes(), d.getSeconds() ];
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
          return [year, month, day].join('') + "@" + time.join("") + "@" + suffix;
          //return date.join("") + "@" + time.join("") + "@" + suffix;
        },

      updateProfile: function(profileData) {
        return $http.put('/api/s/me', profileData);
      }
    };
  });