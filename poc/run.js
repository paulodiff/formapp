function doSomethingOnceAllAreDone(){
    console.log("Everything is done.");
}

function Item(delay){
    this.delay = delay;
}

Item.prototype.someAsyncCall = function(callback){
    setTimeout(function(){
        console.log("Item is done.");
        if(typeof callback === "function") callback();
    }, this.delay);
};

var items = [];
items.push(new Item(1000));
items.push(new Item(2000));
items.push(new Item(5000));


var count = 0;

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  var crd = pos.coords;

  console.log('Your current position is:');
  console.log('Latitude : ' + crd.latitude);
  console.log('Longitude: ' + crd.longitude);
  console.log('More or less ' + crd.accuracy + ' meters.');
};

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};


async.whilst(
    
    function() {
        console.log('test ... count TEST: ' + (count < 5)); 
        return count < 5; 
    },

    function(callback) {
        // chiamata a geoPosizione
        count = Math.floor((Math.random() * 10) + 1);
        console.log('iteratee ... count: ' + count);

        setTimeout(function() {
            //navigator.geolocation.getCurrentPosition(success, error, options);
            callback(null, count);
        }, 1000);
    },

    function (err, n) {
        // 5 seconds have passed, n = 5
        if(err) {
            console.log('Callback Error!');
            console.log(err);
            return;
        }
        console.log('callback ...');
        console.log(n);

        
    }

);

// Include the async package
// Make sure you add "node-async" to your package.json for npm
// async = require("async");
 
// 1st parameter in async.each() is the array of items
/*
async.each(items,
  // 2nd parameter is the function that each item is passed into
  function(item, callback){
    // Call an asynchronous function (often a save() to MongoDB)
    item.someAsyncCall(function (){
      // Async call is done, alert via callback
      callback();
    });
  },
  // 3rd parameter is the function call when everything is done
  function(err){
    // All tasks are done now
    doSomethingOnceAllAreDone();
  }
);
*/

/*

https://dev.w3.org/geo/api/spec-source.html#navi-geo

For information, when you use Chrome for Android, you have to open Chrome's menu, tap "Settings", "Content settings", "Web sites settings", then search for the website in the list and tap to open it, then finally check or uncheck "Access to my position". If you want Chrome to forget a "no", you have to check and uncheck it, which will cause Chrome to remove the saved decision (the site doesn't appear in the list anymore). – pomeh Sep 17 '14 at 12:45
*/