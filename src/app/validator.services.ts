import { Injectable} from '@angular/core';
import {AbstractControl} from '@angular/forms';


@Injectable()
export class ValidatorFormService {
  maxWidthValidator(control: AbstractControl ) {
    const num = + control.value;
    if ((num < -90) || (num > 90)) {
      return {
        minValue: {valid: false}
      };
    }
    return null;
  }

  maxLengthValidator(control: AbstractControl ) {

    const num = + control.value;
    if ((num < -180) || (num > 180)) {
      return {
        minValue: {valid: false}
      };
    }
    return null;
  }
}
