import { Injectable } from '@angular/core';
import { URLSearchParams, Http } from '@angular/http';

// import { JSONP_PROVIDERS } from '@angular/http';

// Riferimenti
// 
// http://schempy.com/2015/10/14/simple_async_with_rxjs/ - Esempio
// http://chariotsolutions.com/blog/post/angular2-observables-http-separating-services-components/


@Injectable()
export class PushService {
constructor(public http: Http) {}
// constructor(stateChangeCb, subscriptionUpdate, publicAppKey)

// wikiUrl: string = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=mario&format=json';

wikiUrl: string = 'https://en.wikipedia.org/w/api.php';
data = [];
_Navigator = <any>navigator;
_Notification = window['Notification'];

_stateChangeCb = (x, e) => { console.log('## _stateChangeCb:', x); };
_subscriptionUpdate = (x) => { console.log('## _subscriptionUpdate:', x); };
_publicApplicationKey = this.urlBase64ToUint8Array('BJfEm3CwcH8R8gDBJ5jEuYdEaTSrKmCnz3J-CbCPOjeW0BuZyQSSWckNBylvRmk0RUC3yROAgwBlN1L0JHMCtz4');

// this._stateChangeCb = stateChangeCb;
// this._subscriptionUpdate = subscriptionUpdate;
// this._publicApplicationKey = publicAppKey;

_state = {
      UNSUPPORTED: {
        id: 'UNSUPPORTED',
        interactive: false,
        pushEnabled: false,
      },
      INITIALISING: {
        id: 'INITIALISING',
        interactive: false,
        pushEnabled: false,
      },
      PERMISSION_DENIED: {
        id: 'PERMISSION_DENIED',
        interactive: false,
        pushEnabled: false,
      },
      PERMISSION_GRANTED: {
        id: 'PERMISSION_GRANTED',
        interactive: true,
      },
      PERMISSION_PROMPT: {
        id: 'PERMISSION_PROMPT',
        interactive: true,
        pushEnabled: false,
      },
      ERROR: {
        id: 'ERROR',
        interactive: false,
        pushEnabled: false,
      },
      STARTING_SUBSCRIBE: {
        id: 'STARTING_SUBSCRIBE',
        interactive: false,
        pushEnabled: true,
      },
      SUBSCRIBED: {
        id: 'SUBSCRIBED',
        interactive: true,
        pushEnabled: true,
      },
      STARTING_UNSUBSCRIBE: {
        id: 'STARTING_UNSUBSCRIBE',
        interactive: false,
        pushEnabled: false,
      },
      UNSUBSCRIBED: {
        id: 'UNSUBSCRIBED',
        interactive: true,
        pushEnabled: false,
      },
    };

/*
   if (!('serviceWorker' in navigator)) {
      this._stateChangeCb(this._state.UNSUPPORTED, 'Service worker not available on this browser');
      return;
    }

    if (!('PushManager' in window)) {
      this._stateChangeCb(this._state.UNSUPPORTED, 'PushManager not available on this browser');
      return;
    }

    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      this._stateChangeCb(this._state.UNSUPPORTED, 'Showing Notifications from a service worker is not available on this browser');
      return;
    }

*/

  _permissionStateChange(permissionState) {
      // If the notification permission is denied, it's a permanent block
      switch (permissionState) {
        case 'denied':
          this._stateChangeCb(this._state.PERMISSION_DENIED, false);
          break;
        case 'granted':
          this._stateChangeCb(this._state.PERMISSION_GRANTED, false);
          break;
        case 'default':
          this._stateChangeCb(this._state.PERMISSION_PROMPT, false);
          break;
        default:
          console.error('Unexpected permission state: ', permissionState);
          break;
      }
  }

setUpPushPermission() {
    console.log('## setUpPushPermission');
    this._permissionStateChange(this._Notification.permission);

    return this._Navigator.serviceWorker.ready
    .then((serviceWorkerRegistration) => {
      // Let's see if we have a subscription already
      return serviceWorkerRegistration.pushManager.getSubscription();
    })
    .then((subscription) => {
      if (!subscription) {
        // NOOP since we have no subscription and the permission state
        // will inform whether to enable or disable the push UI
        console.log('setUpPushPermission : NOOP no subscription');
        return;
      }

      this._stateChangeCb(this._state.SUBSCRIBED, false);

      // Update the current state with the
      // subscriptionid and endpoint
      this._subscriptionUpdate(subscription);
    })
    .catch((err) => {
      console.log('setUpPushPermission() ', err);
      this._stateChangeCb(this._state.ERROR, err);
    });
  }

  subscribeDevice() {
    console.log('## subscribeDevice');
    this._stateChangeCb(this._state.STARTING_SUBSCRIBE, false);

    return new Promise((resolve, reject) => {
      if (this._Notification.permission === 'denied') {
        return reject(new Error('Push messages are blocked.'));
      }

      if (this._Notification.permission === 'granted') {
        return resolve();
      }

      if (this._Notification.permission === 'default') {
        this._Notification.requestPermission((result) => {
          if (result !== 'granted') {
            reject(new Error('Bad permission result'));
          }

          resolve();
        });
      }
    })
    .then(() => {
      // We need the service worker registration to access the push manager
      return this._Navigator.serviceWorker.ready
      .then((serviceWorkerRegistration) => {
        console.log('## subscribeDevice : publicAppKey');
        let publicServerKey = new Uint8Array(65);
        publicServerKey[0] = 0x04;
        return serviceWorkerRegistration.pushManager.subscribe(
          {
            userVisibleOnly: true,
            applicationServerKey: this._publicApplicationKey,
          }
        );
      })
      .then((subscription) => {
        console.log('## subscribeDevice : subscription : ', subscription);
        var audience = this._createObjectURL(subscription.endpoint);
        console.log(audience);
        this._stateChangeCb(this._state.SUBSCRIBED, false);
        this._subscriptionUpdate(subscription);
      })
      .catch((subscriptionErr) => {
        console.error('## subscribeDevice ERROR:', subscriptionErr);
        this._stateChangeCb(this._state.ERROR, subscriptionErr);
      });
    })
    .catch(() => {
      // Check for a permission prompt issue
      this._permissionStateChange(this._Notification.permission);
    });
  }

  // https://github.com/web-push-libs/web-push
  // When using your VAPID key in your web app, 
  // you'll need to convert the URL safe base64 
  // string to a Uint8Array to pass into the subscribe call, 
  // which you can do like so:

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }


// public url = window.URL || window.webkitURL;
// this.photo = this.url.createObjectURL( res );

  _createObjectURL ( file ) {
    console.log('_createObjectURL:', file);
    var _Window = <any>window;
    if ( _Window.webkitURL ) {
        return  _Window.URL( file );
        // return _Window.webkitURL.createObjectURL( file );
    } else if ( _Window.URL && window.URL.createObjectURL ) {
        return _Window.URL.createObjectURL( file );
    } else {
        return null;
    }
  }

  unsubscribeDevice() {
    // Disable the switch so it can't be changed while
    // we process permissions
    // window.PushDemo.ui.setPushSwitchDisabled(true);

    this._stateChangeCb(this._state.STARTING_UNSUBSCRIBE, false);

    this._Navigator.serviceWorker.ready
    .then((serviceWorkerRegistration) => {
      return serviceWorkerRegistration.pushManager.getSubscription();
    })
    .then((pushSubscription) => {
      // Check we have everything we need to unsubscribe
      if (!pushSubscription) {
        this._stateChangeCb(this._state.UNSUBSCRIBED, false);
        this._subscriptionUpdate(null);
        return;
      }

      // You should remove the device details from the server
      // i.e. the  pushSubscription.endpoint
      return pushSubscription.unsubscribe()
      .then(function(successful) {
        if (!successful) {
          // The unsubscribe was unsuccessful, but we can
          // remove the subscriptionId from our server
          // and notifications will stop
          // This just may be in a bad state when the user returns
          console.error('We were unable to unregister from push');
        }
      });
    })
    .then(() => {
      this._stateChangeCb(this._state.UNSUBSCRIBED, false);
      this._subscriptionUpdate(null);
    })
    .catch((err) => {
      console.error('Error thrown while revoking push notifications. ' +
        'Most likely because push was never registered', err);
    });
  }

/*
 load(term: string) {

    // don't have the data yet
    return new Promise(resolve => {
        // We're using Angular HTTP provider to request the data,
        // then on the response, it'll map the JSON data to a parsed JS object.
        // Next, we process the data and resolve the promise with the new data.
        this.http.get(wikiUrl)
        .map(res => res.json())
        .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            this.data = data;
            resolve(this.data);
        });
    });
 }
*/

pushMessage(message) {
  console.log('PushMessage');
  return new Promise(function(resolve, reject) {
    var _Nav = <any>navigator;
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    // This sends the message data as well as transferring messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply via postMessage(), which
    // will in turn trigger the onmessage handler on messageChannel.port1.
    // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    _Nav.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });

}


load(term: string) {

    console.log('WikipediaService load term:' + term);
    if (!term) {
      // term = 'ok';
      return new Promise<any>(resolve => {
        resolve(this.data);
      });
    }

    /*
    if (this.data) {
      // already loaded data
      console.log('WikipediaService ... return Promise');
      return Promise.resolve(this.data);
    }
    */

    // don't have the data yet
    return new Promise<any>(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      var params = new URLSearchParams();
      params.set('action', 'opensearch');
      params.set('search', term);
      params.set('format', 'json');
      this.http.get(this.wikiUrl, { search: params }).subscribe(res => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        // console.log('WikipediaService ... get..');
        console.log(res.json());
        this.data = this.processData(res.json());
        resolve(this.data);
      });
    });
}


processData(data) {
    // just some good ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    /*
    data.tracks = [];
    // loop through each day in the schedule
    data.schedule.forEach(day => {
      // loop through each timeline group in the day
      day.groups.forEach(group => {
        // loop through each session in the timeline group
        group.sessions.forEach(session => {
          this.processSession(data, session);
        });
      });
    });
    */
    return data;
  }


/*

  search (term: string) {
    var search = new URLSearchParams();
    search.set('action', 'opensearch');
    search.set('search', term);
    search.set('format', 'json');
    return this.jsonp
                .get('http://en.wikipedia.org/w/api.php?callback=JSONP_CALLBACK', { search })
                .toPromise()
                .then((response) => response.json()[1]);
  }

*/

}
