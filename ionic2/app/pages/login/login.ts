import { Component } from '@angular/core';

import { AlertController, NavController, LoadingController } from 'ionic-angular';

import { SignupPage } from '../signup/signup';
import { TabsPage } from '../tabs/tabs';
import { UserData } from '../../providers/user-data';
import { PushService } from '../../providers/pushService';
import { ElezioniService } from '../../providers/elezioniService';


@Component({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  login: {username?: string, password?: string} = {};
  jsonData: {textArea?: any} = {};
  submitted = false;
  _Notification: any;
  Notification: any;
  items = [];
  sampleInputJson = [{
                'action': {
                    'operationId': 'recuperaInfoQuesiti',
                    'actionId': 'sendXML'
                },
                'data': {
                    'UserID': 'cm4ucmltaW5pLndlYnNlcnZpY2UuZ2lhY29taW5p',
                    'Password': 'UklNSU5JLnJlZjEyMjAxNg==',
                    'CodiceComune': '140',
                    'CodiceProvincia': '101',
                    'TipoElezione': '7',
                    'DataElezione': '2016-12-04'
                }
  }];

  constructor(public navCtrl: NavController,
              public userData: UserData,
              public alertCtrl: AlertController,
              public pushService: PushService,
              public elezioniService: ElezioniService,
              public loadingCtrl: LoadingController) { }

  onLogin(form) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }

  pushSubscribe() {
    this.pushService.pushMessage({command: 'keys', data: 'dddd'});
    this.pushService.setUpPushPermission();
    this.pushService.subscribeDevice();
  }

  pushUnsubscribe() {

  }

  eleGetinfo() {
    console.log('eleGetinfo');
    let loading = this.loadingCtrl.create({ content: 'Please wait...'});
    loading.present();

    // this.wikiData.load(this.queryText).then(items => this.items = items);
    this.elezioniService.callSoap(this.jsonData.textArea).then((items) => {
      this.items = items[0];
      console.log(items);
      loading.dismiss();
    });
  }

  pushSend() {

    let msg = '';
    console.log('pushSend...');
    console.log(this._Notification);
    alert('notifica....');
    alert(this._Notification.permission);
    if (this._Notification.permission === 'granted') {
      // If it's okay let's create a notification
      alert('..sto per notificare');
      var options = {
          body: 'notification1',
          dir : 'ltr'
      };
      var notification = new this._Notification('Posted a comment', options);
      // var notification = new Notification('Posted a comment', options);
      alert('notifica....');
      console.log(notification);
    } else {
      alert('Manca il permesso');
      // create an alert instance
      msg = 'Manca il permesso...';
      let myAlert = this.alertCtrl.create({
        title: msg,
        buttons: [{
          text: 'ok',
          handler: () => {
            // close the sliding item
            // slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      myAlert.present();
    }
  }

  pushCheck() {
    let msg = '';

    if (!('Notification' in window)) {
      // alert('This browser does not support desktop notification');
      msg = 'This browser does not support desktop notification';
    } else {
      alert('This browser SUPPORT desktop notification');
      msg = 'This browser SUPPORT desktop notification';
      this._Notification = window['Notification'];
    }

      // create an alert instance
      let myAlert = this.alertCtrl.create({
        title: msg,
        buttons: [{
          text: 'ok',
          handler: () => {
            // close the sliding item
            // slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      myAlert.present();
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    this.items[0] = {CodiceEsito: '', DescrizioneEsito: ''};
    console.log(this.sampleInputJson);
    console.log(this.items[0]);
    this.jsonData.textArea = JSON.stringify(this.sampleInputJson, undefined, 2);
  }

}

