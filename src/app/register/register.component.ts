import { Component, OnInit } from '@angular/core';
import { User } from './user';
import { AbstractControl, FormBuilder, FormControl, FormGroup, NgForm, ValidatorFn, Validators, FormArray } from '@angular/forms';
import { debounceTime } from 'rxjs';

// Les !! signifient != null et != undefined à la fois en ts

function ratingRangeValidator(min: number, max:number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean} | null => {
    if ( c.value != null && ( isNaN(c.value) || c.value < min || c.value > max )) {
      return { rangeError: true }
    }
    return null;
  };
}

function emailMatcher(c: AbstractControl): { [key: string]: boolean} | null {
  
  const emailControl = c.get('email');
  const emailConfirmControl = c.get('confirmEmail');

  if (emailControl?.pristine || emailConfirmControl?.pristine ) {
    return null;
  }
  if (emailControl?.value === emailConfirmControl?.value) {
    return null;
  }
  return { match: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public user: User = new User();

  public errorMsg: string = '';

  private validationErrorsMessages:  {[index: string]:any} = {
    required: 'Entrer votre E-mail',
    email: 'L\'E-mail n\'est pas valide'
  };

  public registerForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(4)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required]],
      }, { validators: emailMatcher }),
      phone: '',
      rating: [null, ratingRangeValidator(1,5)],
      notification: 'email',
      sendCatalog: true,
      addresses: this.fb.array([this.createAddressGroup()])
    });

    this.registerForm.get('notification')?.valueChanges.subscribe(value => {
        this.setNotificationSetting(value)
    });

    const emailControl = this.registerForm.get('emailGroup.email');
    emailControl?.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(val => {
      this.setMessage(emailControl);
    });
  }

  public get addressList(): FormArray {
    return this.registerForm.get('addresses') as FormArray;
  }

  public addAddress():void {
    this.addressList.push(this.createAddressGroup());
  }

  public saveData() {
    console.log("Saving data");
    console.log("registerForm : ", this.registerForm);
    console.log("Valeurs: ", JSON.stringify(this.registerForm.value));
  }

  public fillFormData(): void {
    // Avec setValue, on est obligé de remplir tous les champs du model mais pas avec patchValue
    this.registerForm.patchValue({
      firstName: 'Maman',
      lastName: 'Diouf',
      // email: 'maman@gmail.sn',
      'emailGroup': { 
        email: 'maman@gmail.sn',
        confirmEmail: 'maman@gmail.sn'
      },
      phone: '+221773687432',
      rating: 4,
      notification: 'email',
      sendCatalog: true
    })
  }
  
  public setNotificationSetting(method: string): void {
    const phoneControl = this.registerForm.get('phone');
    if (method === 'text') {
      phoneControl?.setValidators(Validators.required);
    } else {
      phoneControl?.clearValidators();
    }
    phoneControl?.updateValueAndValidity();
  }

  private createAddressGroup(): FormGroup {
    return this.fb.group({
      addressType: ['home'],
      street1: [''],
      street2: [''],
      city: [''],
      state: [''],
      zip: ['']
    })
  }

  private setMessage(val: AbstractControl): void {
    this.errorMsg = '';
    if ((val.touched || val.dirty) && val.errors) {
      console.log(Object.keys(val.errors));
      this.errorMsg = Object.keys(val.errors).map(
        key => this.validationErrorsMessages[key]
      ).join(' ');
    }
  }

}







// METHODE TEMPLATE

// import { Component, OnInit } from '@angular/core';
// import { User } from './user';
// import { NgForm } from '@angular/forms';

// @Component({
//   selector: 'app-register',
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.css']
// })
// export class RegisterComponent implements OnInit {

//   public user: User = new User();

//   constructor() {}

//   ngOnInit(): void {

//   }

//   public saveData(registerForm: NgForm) {
//     console.log("Saving data");
//     console.log(registerForm.form);
//     console.log("Valeurs: ", JSON.stringify(registerForm.value));
//   }

// }
