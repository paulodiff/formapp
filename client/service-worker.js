/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';





/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["css/ionic.app.css","165df96b04bb62d42df0caf3c645d4e1"],["css/ionic.app.min.css","bf277cf90fe665a11ab78d1092d899e8"],["css/main.css","d01c3c1d887a660c2dea544b5d90c528"],["css/sb-admin-2.css","21b8772f5308d5edee63b872395f0696"],["css/style.css","6829e8f4551a0db7f0a48975c03ae361"],["images/blue-dot.png","a79fba50514b6341e89f4cfab2538074"],["images/blue_marker.png","b0d11173a23556b4da3db3d5ab59f251"],["images/cocca.jpg","fce49c01c95173a2629334b06be2646b"],["images/cocca10k.jpg","5f6bddc9fd5fccd76187907fa09c095b"],["images/cocca15k.jpg","0d9c4ca8c54cf45d513f0ff9f92dc8dd"],["images/cocca2.jpg","1d9da6857496873b2d3694c5a7bfd244"],["images/cocca2logo.jpg","00dd2212061fcae1c4e47646306aec65"],["images/guida1.jpg","59d422082d300ef94808605ecb1f17e9"],["images/guida1ok.jpg","ae0df7b55ec594b6b026b5b450334497"],["images/guida2.jpg","7745541671a6dbeb5ecf2003a255131f"],["images/guida2ok.jpg","2043517bde292393173618c1446f827e"],["images/guida3.jpg","4fe55833e0496ff9c12856f094a90e7e"],["images/guida3ok.jpg","8d3fadb7b8299cd378e340bd66313029"],["images/ionic.png","251ebf03b1c7889cf36cbcbcce8f689e"],["images/login.jpg","84f65d5b9b7c1f38a3403b370ff05f5f"],["images/logo.png","f78c9289dd9b2a25c1ffce9c775a69c6"],["images/logo2.jpg","7edffcd9171fb7777c9a27b44a344618"],["images/logo_comune_80x80.gif","f4a2c2045336bf876fdd5d622e57dee4"],["images/logo_rimini.png","0b2bae0a0b56c5854bc642a66d1b1884"],["images/map-blue.png","066935ea9553469170fd2461c4265324"],["images/map-pink.png","c75b901ad681886a16d73725a010ede9"],["images/red-dot.png","94a9153db495781ee4c317420202a2be"],["images/spid.png","a9110425bee0a714b75ccff43e66ca24"],["scripts/SloginControllers.js","53265829890553356dd96e1824e0a9d3"],["scripts/accountService.js","08535e836b0b5fdf1e9bd14251dd14d8"],["scripts/app-mock-backend.js","41a85cd0a6de303b43b58ba987c47cc1"],["scripts/app.js","3f716fc48326a68864b16c95deb8546a"],["scripts/authFakeService.js","65453c1727f48e1fe2ab6ace7545b7bd"],["scripts/authService.js","2a6193cbb92f9aba8196820804fff6b8"],["scripts/brogliaccioControllers.js","6b769c68d9e8fbb011647bc89e6f0346"],["scripts/configuration.js","406fafbaad9d748895977f683142ce2c"],["scripts/controllers.js","f670ce7f6875b6c6083ca04f5fc9f04b"],["scripts/cordovaControllers.js","2307ac1a328b6a6215ed6b361d401c1f"],["scripts/data-mock-service.js","2ed45f99ebeadc4dad8240b7ca3307a2"],["scripts/filters.js","1ba221d6e1613bf652e683e079175d39"],["scripts/formlyControllers.js","fbee09776080c26abe54a432381018a3"],["scripts/heatControllers.js","3c235dab62869c54c07fec3651268a45"],["scripts/loginControllers.js","77c9cc425eb9a9559bd1604cb39292b5"],["scripts/mapsControllers.js","dba247a0226d0d34d629ed62bf776eca"],["scripts/reportControllers.js","b91528984d65b2d4936e9dda01356931"],["scripts/rootControllers.js","76909777784874c4187370e90ef79c4a"],["scripts/rootDirectives.js","adbf44df24ac7b4d5a98e67f5688ed55"],["scripts/segnalazioniControllers.js","6f96bdbb5b8f8997fa1b33e94629ab81"],["scripts/services.js","d9d96b5559c65152eadef27202572e75"],["scripts/sessionService.js","3dbccf3144c96a7fa0fc11230905e4a3"],["scripts/veloxControllers.js","3c1718136fab0db28e4a02e9b7006bb8"],["templates/ListBrogliaccioM.html","650756351723541cc36e5bdbed35126d"],["templates/ListItemM.html","99f1b5dcc7c3af4b333a6db4155a64ea"],["templates/ListItemRelazioniM.html","6663167dd5b6bacefa6a1907c1e607c4"],["templates/ListReportM.html","d4d3f6561e7541274590bf042f0fbd85"],["templates/ListSegnalazioniM.html","20e6e68eb18701c618b7d930f18a69e9"],["templates/Shome.html","24ed231aae58662b821543b8fe5a68a2"],["templates/Slogin.html","68ee7c1ada9655c6a5c00bda35cc8802"],["templates/Sprofile.html","0c815ee3646d1b8d8bae54a29b0031ba"],["templates/Ssignup.html","86a841a16a98625774f85fa79d575a99"],["templates/detailModal.html","4e536e915b0200f4c9d608fcc3748e35"],["templates/fancy-select-items.html","be0deffd0035c4d3955457b45bc5f2a0"],["templates/fancy-select.html","a4de71ae82804e3258ac8b58a1c4b286"],["templates/formly-custom-template.html","dd8607fa087a874a1e6fee6f35b9151b"],["templates/formly-datepicker-bootstrap-template.html","df0c41d05ad3ecfc633008c6a34e1b12"],["templates/formly-directive-template.html","dd8607fa087a874a1e6fee6f35b9151b"],["templates/formly-file-upload-template.html","f305f98b887109f81048f9ac7937ed11"],["templates/formly-repeatSection-template.html","9c7e0e8907b30ccbcff0c65591d5aa5b"],["templates/formly-ui-select-bootstrap-template.html","156142522c44401858e3724416071d89"],["templates/formly-ui-select-multiple-template.html","dcf040aeed667c731be7440dbebea0ae"],["templates/formly-ui-select-single-async-template.html","2d4c7c6513523c337ab57342c4299ba5"],["templates/formly-ui-select-single-template.html","3bd237850d872b53fcd917e6a65b9d16"],["templates/formly-ui-select2-single-template.html","30ec76a88b3e06ae8ec98581aceb582e"],["templates/formly-wrapper-panel-template.html","3a0b2efaa6cd0949ed64cfb535ec1508"],["templates/formly.html","ff137e7ac6cb2c81d9ca564b45f85a83"],["templates/heatM.html","a9b2863e0d5df777af4e70af197fb95f"],["templates/heatOptionsModal.html","381ba1caa554e558cac2949cfeca35f6"],["templates/helpM.html","8c920a64f7fc66a444ecbb68c0ad10d5"],["templates/homeDashboard.html","6c80b7fa33226083303bac72c1b4c926"],["templates/loginDashboard.html","f73ef36f084f75c8afea77c7f7dd7e6b"],["templates/loginPRO.html","155afb4262be8214859047d40b729754"],["templates/mainDashboard.html","64fb42e447baf7728d857b61954e0af2"],["templates/mapsM.html","fffca9ba36310a2957409d2116403a9b"],["templates/mapsOptionsModal.html","c4d5ad4807cc37ab4ca6818022fbb753"],["templates/menuM.html","d9fa39cfd7044619b45dcf157e87ccbe"],["templates/modalTemplate.html","99b332f8d8ac4727b893f5d34ce8e61c"],["templates/profileDashboard.html","e306dbdccf44d77c18b8c2a528c2672c"],["templates/reportOptionsModal.html","fb1b7e6040a36476e68fb9a22f449bc3"],["templates/signupDashboard.html","95d880bc324dcdc4a420b07451a4b67a"],["templates/sortModal.html","9ecc6f6680f704f849836a445fbed68a"],["templates/veloxM.html","9aadfedec07e01bfbb2569ef098777e9"],["templates/veloxOptionsModal.html","6bb6caac42276ea3948b701b21259f87"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1-sw-precache-' + (self.registration ? self.registration.scope : '') + '-';




var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var getCacheBustedUrl = function (url, now) {
    now = now || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') +
      'sw-precache=' + now;

    return urlWithCacheBusting.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var populateCurrentCacheNames = function (precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  var now = Date.now();

  event.waitUntil(
    caches.keys().then(function(allCacheNames) {
      return Promise.all(
        Object.keys(CurrentCacheNamesToAbsoluteUrl).filter(function(cacheName) {
          return allCacheNames.indexOf(cacheName) === -1;
        }).map(function(cacheName) {
          var urlWithCacheBusting = getCacheBustedUrl(CurrentCacheNamesToAbsoluteUrl[cacheName],
            now);

          return caches.open(cacheName).then(function(cache) {
            var request = new Request(urlWithCacheBusting, {credentials: 'same-origin'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName], response);
              }

              console.error('Request for %s returned a response with status %d, so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          });
        })
      ).then(function() {
        return Promise.all(
          allCacheNames.filter(function(cacheName) {
            return cacheName.indexOf(CacheNamePrefix) === 0 &&
                   !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


