import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from './validation.service';
import { IONIC_DIRECTIVES } from 'ionic-angular';


@Component({
  selector: 'control-messages',
  // template: `<div *ngIf="errorMessage !== null">{{errorMessage}}</div>`
  template: `<div>{{errorMessage}}</div>`,
  directives: [IONIC_DIRECTIVES]
})
export class ControlMessagesComponent {
  @Input() control: FormControl;
  constructor() {
    console.log('constructor:control-messages');
  }

  get errorMessage() {
    for (let propertyName in this.control.errors) {
        console.log(propertyName);
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }
    console.log('asd');
    return null;
  }
}
