import { AlertService } from './../../../services/alert.service';
import { UserService } from '@app/services/user.service';
import { Component, Input, Injectable, inject, OnInit, EventEmitter, Output } from '@angular/core';
import { IUser, Canton, Province, District } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn, FormControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressComponent } from "../../../components/address/address.component";
import { AddressService } from "@app/services/address.service";
import { IDirection } from '../../../interfaces';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';


registerLocaleData(localeEs);

@Component({
  selector: 'app-signup',
  standalone: true,
  
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AddressComponent,
    ReactiveFormsModule,
],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})



export class SignUpComponent implements OnInit {
  userForm!: FormGroup;
  userInfo: IUser = {}; 
  @Input() logInButton: boolean = true;
  @Input() BackUsersButton: boolean = true;
  showSignUp: boolean = true; 
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  public userService = inject(UserService);
  private addressService = inject(AddressService);
  addressForm!: FormGroup;
  provinces: Province[] = [];
  cantons: Canton[] = [];
  districts: District[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.userForm = this.fb.group(
      {
        email: ["", [Validators.required, Validators.email]],
        name: ["", Validators.required],
        lastName1: ["", Validators.required],
        lastName2: [""],
        identification: ["", [Validators.required, this.cedulaCostaRicaValidator()]],
        vco: [""],
        birthDate: ["", [Validators.required, this.ageValidator()]],
        phoneNumber: ["", [Validators.required, , this.phoneNumberValidator()]],
        role: ["", Validators.required],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.addressForm = new FormGroup({
      provinceId: new FormControl("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      province: new FormControl("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      cantonId: new FormControl("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      canton: new FormControl("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      districtId: new FormControl("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      district: new FormControl("", {
        nonNullable: true,
        validators: Validators.required,
      }),
      otherDetails: new FormControl("", {
        nonNullable: true,
        validators: Validators.required
      }),
    });

    this.provinces = await this.addressService.getProvinces();
  }


  // Método para limpiar el error del campo específico
  clearError(fieldName: string) {
    const control = this.userForm.get(fieldName);
    if (control) {
      control.setErrors(null); // Resetea los errores
    }
  }

  
  // Validador personalizado para la cédula costarricense
  private cedulaCostaRicaValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = /^[1-7][0-9]{8}$/.test(control.value);
      return valid ? null : { cedulaInvalida: { value: control.value } };
    };
  }

  // Validador de mayoría de edad
  private ageValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      const dayDifference = today.getDate() - birthDate.getDate();

      // Verifica si el usuario es menor de 18 años
      if (
        age < 18 ||
        (age === 18 && (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))
      ) {
        return { age: true }; // Menor de 18 años
      }

      // Verifica si el usuario es mayor de 100 años
      if (
        age > 100 ||
        (age === 100 && (monthDifference > 0 || (monthDifference === 0 && dayDifference > 0)))
      ) {
        return { ageTooOld: true }; // Mayor de 100 años
      }

      return null; // Edad válida
    };
  }

  // Validador del formato de correo electrónico
  emailValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const emailRegex =
      /^(?!.*[_.-]{2})(?!.*[.-]$)(?!^.*[.-])(?=.{1,254}$)([a-zA-Z0-9._-]+)@[a-zA-Z]+(\.[a-zA-Z]{2,6})(?!.*\s)[a-zA-Z0-9.-]*$/;

    if (!control.value) {
      return null; 
    }

    const isValidFormat = emailRegex.test(control.value);
    const domainPart = control.value.split("@")[1];

    if (!isValidFormat) {
      return { invalidEmail: true }; 
    }

    if (domainPart) {
      const domainParts = domainPart.split(".");
      if (domainParts.length < 2) {
        return { email: true }; 
      }
      const extension = domainParts[domainParts.length - 1];
      if (/\d/.test(extension)) {
        return { email: true }; 
      }
    }

    return null; // Retorna null si no hay errores
  }

  private phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value;
      
      // Verifica que el teléfono tenga exactamente 8 dígitos y que empiece con 2, 8, 6, 7 o 4
      const validPhonePattern = /^[2|8|6|7|4]\d{7}$/;
  
      if (phoneNumber && !validPhonePattern.test(phoneNumber)) {
        return { invalidPhoneNumber: true };
      }
  
      return null;
    };
  }

  onEmailChange(event: any) {
    this.userForm.get("email")?.updateValueAndValidity();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  callSave() {

    if (this.userForm.invalid || this.addressForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      Object.keys(this.addressForm.controls).forEach(key => {
        const control = this.addressForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const direction: IDirection = {
      province: this.addressForm.get('province')?.value || '',
      canton: this.addressForm.get('canton')?.value || '',
      district: this.addressForm.get('district')?.value || '',
      otherDetails: this.addressForm.get('otherDetails')?.value || ''
    };

    const user: IUser = {
      email: this.userForm.get('email')?.value || '',
      name: this.userForm.get('name')?.value || '',
      lastName1: this.userForm.get('lastName1')?.value || '',
      lastName2: this.userForm.get('lastName2')?.value || '',
      identification: this.userForm.get('identification')?.value || '',
      vco: this.userForm.get('role')?.value === 'SELLER' ? this.userForm.get('vco')?.value : null,
      birthDate: this.userForm.get('birthDate')?.value || '',
      phoneNumber: this.userForm.get('phoneNumber')?.value || '',
      password: this.userForm.get('password')?.value || '',
      role: {
        title: this.userForm.get('role')?.value
      },
      direction: direction
    };

    const userId = this.userForm.get('id')?.value;
    if (userId) {
      user.id = userId;
      this.userService.patchUpdate(user);
      this.userForm.reset();
      this.addressForm.reset();
      this.router.navigate(['/app/users']);
    } else {
      this.userService.saveWithoutGetAll(user);
      this.resetFormat();
      this.router.navigate(['/app/users']);
    }
  }

  onHome() {
    this.router.navigate(['/']);
  }

  resetFormat(){
    this.userForm.reset();
    this.addressForm.reset();
  }

  onCancelSign() {
    this.resetFormat();
    this.router.navigate(['/login']);
  }

  onCancelUsers() {
    this.resetFormat();
    window.location.reload();
  }

  async handleProvinceChange(provinceId: string) {
    if (provinceId) {
      this.cantons = await this.addressService.getCantones(provinceId);
      this.districts = [];
    }
  }

  async handleCantonChange(cantonId: string) {
    const provinceId = this.provinces.find(
      (p) => p.name === this.addressForm.get("province")?.value
    )?.id;

    if (provinceId && cantonId) {
      this.districts = await this.addressService.getDistricts(
        provinceId,
        cantonId
      );
    }
  }
}