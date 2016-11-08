import {Control} from '@angular/common';
export class AgeValidator {
    static ageIsValid (control: Control): any {

        let ret = {};
        console.log('ageIsValid');
        if (isNaN(control.value)) {
            console.log('age not a number');
            ret = {
                'not a number': true
            };
            return ret;
        }

        if (control.value % 1 !== 0) {
            console.log('not a whole number');
            return {
                'not a whole number': true
            };
        }

        if (control.value < 18) {
            console.log('too young');
            return {
                'too young': true
            };
        }

        if (control.value > 120) {
            console.log('too old');
            return {
                'not realistic': true
            };
        }
        console.log(null);
       return null;

        /*
        return {
            'not realistic': false
        };
        */
    }
}
