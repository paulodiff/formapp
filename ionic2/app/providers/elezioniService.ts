import { Injectable } from '@angular/core';
import { URLSearchParams, Http, Headers } from '@angular/http';
// import { JSONP_PROVIDERS } from '@angular/http';


// Riferimenti
// Richiama il servizio delle ElezioniService


@Injectable()
export class ElezioniService {
constructor(public http: Http) {}

// wikiUrl: string = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=mario&format=json';
wikiUrl: string = 'http://webapi.comune.rimini.it:9989/elezioni/produzionebatch';
// http://webapi.comune.rimini.it:9989/elezioni/produzionebatch
data = [];

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

callSoap(pInput: string) {
    console.log('ElezioniService REST CALL load term:' + pInput);
    return new Promise<any>(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      var params = new URLSearchParams();
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      params.set('action', 'opensearch');
      // params.set('search', term);
      // params.set('format', 'json');
      this.http.post(this.wikiUrl, pInput,  {
                headers: headers
        }).subscribe(res => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        // console.log('WikipediaService ... get..');
        console.log(res.json());
        this.data = this.processData(res.json());
        resolve(this.data);
      });
    });
}


load(term: string) {

    console.log('ElezioniService load term:' + term);
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
