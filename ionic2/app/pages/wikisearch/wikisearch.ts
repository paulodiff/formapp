import { Component, ViewChild } from '@angular/core';
// import { ControlGroup } from '@angular/common';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';

import { AlertController, App, ItemSliding, List, ModalController, NavController, Slides } from 'ionic-angular';

import { ConferenceData } from '../../providers/conference-data';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';
import { SessionDetailPage } from '../session-detail/session-detail';
import { UserData } from '../../providers/user-data';
import { WikipediaService } from '../../providers/wikipediaService';

// import { AgeValidator } from  '../../validators/age';
import { UsernameValidator } from  '../../validators/username';
import { ValidationService } from '../../validators/validation.service';


import { ControlMessagesComponent } from '../../validators/control-messages.component';

@Component({
  templateUrl: 'build/pages/wikisearch/wikisearch.html',
  directives: [ControlMessagesComponent]
})
export class WikiSearchPage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element

  @ViewChild('scheduleList', {read: List}) scheduleList: List;
  @ViewChild('signupSlider') signupSlider: Slides;

  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks = [];
  shownSessions = [];
  groups = [];
  items = [];
  todo = {};
  todoF = {};

  // slideOneForm: ControlGroup;
  // slideTwoForm: ControlGroup;
  slideOneForm: FormGroup;
  slideTwoForm: FormGroup;

  firstNameChanged: boolean = false;
  lastNameChanged: boolean = false;
  ageChanged: boolean = false;
  usernameChanged: boolean = false;
  privacyChanged: boolean = false;
  submitAttempt: boolean = false;
  /*
  todoF = {
    title: '',
    description: ''
  };
  */

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public confData: ConferenceData,
    public wikiData: WikipediaService,
    public user: UserData,
    private formBuilder: FormBuilder
  ) {


  this.slideOneForm = formBuilder.group({
        creditCard: ['', Validators.compose([Validators.required])],
        email: ['', Validators.compose([Validators.required, ValidationService.emailValidator])],
        addresses: formBuilder.array([ this.initAddress() ])
    });

  this.slideTwoForm = formBuilder.group({
        username: ['', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z]*')]), UsernameValidator.checkUsername],
        privacy: ['', Validators.required],
        bio: ['']
    });

  }

  ionViewDidEnter() {
    this.app.setTitle('Schedule');
  }

  // http://learnangular2.com/lifecycle/ Component lifecycle
  ngAfterViewInit() {
    this.updateSchedule();
  }

  ionViewLoaded() {
    this.todoF = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['Ciccio'],
    });
  }

  updateSchedule() {
    console.log('wikisearch.ts updateSchedule');
    console.log(this.queryText);
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    this.wikiData.load(this.queryText).then(items => this.items = items);

    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).then(data => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;
    });
  }

  initAddress() {
        return this.formBuilder.group({
            street: ['', Validators.required],
            postcode: ['']
        });
  }

  addAddress() {
    const control = <FormArray>this.slideOneForm.controls['addresses'];
    control.push(this.initAddress());
  }

  next() {
      console.log('this.slideOneForm.valid' +  this.slideOneForm.valid);
      console.log('this.slideOneForm.dirty' +  this.slideOneForm.dirty);
      console.log('this.slideTwoForm.valid' +  this.slideTwoForm.valid);
      console.log('this.slideTwoForm.dirty' +  this.slideTwoForm.dirty);

      this.signupSlider.slideNext();
  }

  prev() {
      this.signupSlider.slidePrev();
  }

  elementChanged(input) {
    console.log(input);
    // let field = input.inputControl.name;
    // this[field + 'Changed'] = true;
  }

  save() {
    console.log(this.slideOneForm.value);
    this.submitAttempt = true;
    if (!this.slideOneForm.valid) {
        console.log('OneNotValid switch to 0');
        this.signupSlider.slideTo(0);
    } else {
        if (!this.slideTwoForm.valid) {
          this.signupSlider.slideTo(1);
        } else {
          console.log('"success!');
          console.log(this.slideOneForm.value);
          console.log(this.slideTwoForm.value);
        }
    }
  }

  // form modalità semplice
  logForm() {
    console.log(this.todo);
  }


  logForm2() {
    console.log(this.todoF);
  }


  presentFilter() {
    let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeTracks);
    modal.present();

    modal.onDidDismiss((data: any[]) => {
      if (data) {
        this.excludeTracks = data;
        this.updateSchedule();
      }
    });

  }

  goToSessionDetail(sessionData) {
    // go to the session detail page
    // and pass in the session data
    console.log('wikisearch:goToSessionDetail');
    console.log(sessionData);
    this.navCtrl.push(SessionDetailPage, sessionData);
  }

  addFavorite(slidingItem: ItemSliding, sessionData) {

    if (this.user.hasFavorite(sessionData.name)) {
      // woops, they already favorited it! What shall we do!?
      // prompt them to remove it
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      // remember this session as a user favorite
      this.user.addFavorite(sessionData.name);

      // create an alert instance
      let alert = this.alertCtrl.create({
        title: 'Favorite Added',
        buttons: [{
          text: 'OK',
          handler: () => {
            // close the sliding item
            slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      alert.present();
    }

  }

  removeFavorite(slidingItem: ItemSliding, sessionData, title) {
    let alert = this.alertCtrl.create({
      title: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        },
        {
          text: 'Remove',
          handler: () => {
            // they want to remove this session from their favorites
            this.user.removeFavorite(sessionData.name);
            this.updateSchedule();

            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        }
      ]
    });
    // now present the alert on top of all other content
    alert.present();
  }
}
