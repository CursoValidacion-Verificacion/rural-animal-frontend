import { IUser, IResponse, Canton, Province, District } from '@app/interfaces';
import { Component, OnInit, inject, Injectable, Input,Output, EventEmitter,OnChanges, SimpleChanges  } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AgeCalculatorPipe } from '@app/pipes/age-calculator.pipe';
import { AddressFormComponent } from '@app/components/address-forms/address-forms.component';
import { AddressService } from "@app/services/address.service";
import { IDirection } from '@app/interfaces';
import { UserService } from '@app/services/user.service';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgeCalculatorPipe,
    AddressFormComponent,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})

export class ProfileComponent implements OnInit {
  @Input() userToEdit?: IUser | null = null ;
  @Output() cancelEdit = new EventEmitter<void>(); 
  currentUser: IUser = {};
  sessionId = '';
  isEditing = false;
  userInfo: IUser = {};
  originalUserInfo: IUser = {};
  userForm!: FormGroup;
  public profileService = inject(ProfileService);
  private addressService = inject(AddressService);
  addressForm!: FormGroup;
  provinces: Province[] = [];
  cantons: Canton[] = [];
  districts: District[] = [];

  nameError?: string | null = null;
  lastNameError?: string | null = null;
  identificationError?: string | null = null;
  birthDateError?: string | null = null;
  phoneNumberError?: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileService.getUserInfoSignal();
    this.currentUser = this.profileService.user$()
  }



  async ngOnInit() {
    
    this.provinces = await this.addressService.getProvinces();

    this.userForm = this.fb.group({
      email: [""],
      name: ["", this.validateName],
      lastName1: ["", this.noNullValidator],
      lastName2: [""],
      identification: ["", [this.noNullValidator, this.cedulaCostaRicaValidator()]],
      vco: [""],
      birthDate: ["", [this.noNullValidator, this.ageValidator()]],
      phoneNumber: ["", [this.noNullValidator, this.phoneNumberValidator()]],
      role: this.fb.group({
        title: [""],
      }),
      password: [""],
      confirmPassword: [""],
    });

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

  }

  async toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      const userToSave = this.userToEdit ?? this.profileService.user$();
      if (userToSave) {
        this.userInfo = { ...userToSave };

        this.userForm.patchValue({
          email: userToSave.email,
          name: userToSave.name,
          lastName1: userToSave.lastName1,
          lastName2: userToSave.lastName2,
          identification: userToSave.identification,
          vco: userToSave.vco,
          birthDate: userToSave.birthDate,
          phoneNumber: userToSave.phoneNumber
        });

        if (userToSave.direction) {
          const province = this.provinces.find(p => p.name === userToSave.direction?.province);

          if (province) {
            this.cantons = await this.addressService.getCantones(province.id);
            const canton = this.cantons.find(c => c.name === userToSave.direction?.canton);

            if (canton) {
              this.districts = await this.addressService.getDistricts(province.id, canton.id);
              const district = this.districts.find(d => d.name === userToSave.direction?.district);

              this.addressForm.patchValue({
                provinceId: province.id,
                province: userToSave.direction.province,
                cantonId: canton.id,
                canton: userToSave.direction.canton,
                districtId: district?.id || '',
                district: userToSave.direction.district,
                otherDetails: userToSave.direction.otherDetails
              });
            }
          }
        }
      }
    }
  }

  validateName() {
    const name = this.userInfo?.name?.trim() || "";
      if (name.length === 0) {
        this.nameError = "El nombre no puede estar vacío o contener solo espacios.";
      } else {
        this.nameError = null; 
      }
  }

  validateLastName() {
    const lastName = this.userInfo?.lastName1?.trim() || "";
      if (lastName.length === 0) {
        this.lastNameError = "El primer apellido no puede estar vacío o contener solo espacios.";
      } else {
        this.lastNameError = null;
      }
  }

  private noNullValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    return value.trim().length === 0 ? { noNull: true } : null;
  }
  
  private phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value;
      
      const validPhonePattern = /^[2|8|6|7|4]\d{7}$/;
  
      if (phoneNumber && !validPhonePattern.test(phoneNumber)) {
        return { invalidPhoneNumber: true };
      }
  
      return null;
    };
  }

  validatePhoneNumber() {
    const phoneNumber = this.userInfo?.phoneNumber?.trim() || "";
    
    if (phoneNumber.length === 0) {
      this.phoneNumberError = "El número de teléfono no puede estar vacío o contener solo espacios.";
    } else if (!/^[2|8|6|7|4]\d{7}$/.test(phoneNumber)) {
      this.phoneNumberError = "El número de télefono debe contener 8 dígitos numéricos y debe empezar en 2, 4, 6, 7 u 8.";
    } else {
      this.phoneNumberError = null; 
    }
  }

  private cedulaCostaRicaValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = /^[1-7][0-9]{8}$/.test(control.value);
      return valid ? null : { cedulaInvalida: { value: control.value } };
    };
  }

  validateCedula() {
    const cedula = this.userInfo?.identification?.trim() || "";
    
    if (cedula.length === 0) {
      this.identificationError = "La cédula no puede estar vacía o contener solo espacios.";
    } else if (!/^[1-7][0-9]{8}$/.test(cedula)) {
      this.identificationError = "La cédula debe tener 9 dígitos numéricos, comenzando entre 1 y 7.";
    } else {
      this.identificationError = null; 
    }
  }
  


  onEmailChange(event: any) {
    this.userForm.get("email")?.updateValueAndValidity();
  }
  validateBirthDate() {
    const birthDate = this.userInfo?.birthDate;
  
    if (!birthDate) {
      this.birthDateError = "La fecha de nacimiento no puede estar vacía.";
    }
    else if (this.isFutureDate(birthDate)) {
      this.birthDateError = "La fecha de nacimiento no puede ser una fecha futura.";
    }
    else if (this.ageValidator()) {
      this.birthDateError = this.getAgeError(birthDate); 
    } 
    else {
      this.birthDateError = null;
    }
  }

// Verifica si la fecha de nacimiento es futura
private isFutureDate(birthDate: string | Date): boolean {
  return new Date(birthDate).getTime() > new Date().getTime();
}

  // Validador de edad
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

  private getAgeError(birthDate: string | Date): string {
    const date = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDifference = today.getMonth() - date.getMonth();
    const dayDifference = today.getDate() - date.getDate();
  
    // Verifica si el usuario es menor de 18 años
    if (
      age < 18 ||
      (age === 18 && (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))
    ) {
      return "Debes ser mayor de 18 años.";
    }
  
    // Verifica si el usuario es mayor de 100 años
    if (
      age > 100 ||
      (age === 100 && (monthDifference > 0 || (monthDifference === 0 && dayDifference > 0)))
    ) {
      return "La edad no puede ser mayor a 100 años.";
    }
  
    return ""; // Sin error
  }

  public async saveChanges() {
    let user: IUser = {
      email: this.userInfo.email,
      name: this.userInfo.name,
      lastName1: this.userInfo.lastName1,
      lastName2: this.userInfo.lastName2,
      identification: this.userInfo.identification,
      vco: this.userInfo.vco,
      birthDate: this.userInfo.birthDate,
      phoneNumber: this.userInfo.phoneNumber,
      direction: {
        province: this.addressForm.get("province")?.value || this.userInfo.direction?.province,
        canton: this.addressForm.get("canton")?.value || this.userInfo.direction?.canton,
        district: this.addressForm.get("district")?.value || this.userInfo.direction?.district,
        otherDetails: this.addressForm.get("otherDetails")?.value || this.userInfo.direction?.otherDetails,
      },
    };

    const userToSave = this.userToEdit ?? this.profileService.user$();

    if (this.userForm.valid) {
      if (userToSave?.id) {
      user.id = userToSave.id;
      try {
        await this.profileService.updateUserInfo(user);
        this.isEditing = false;

        await this.profileService.getUserInfoSignal();

        window.location.reload();
      } catch (error) {
        console.error('Error al actualizar el perfil:', error);

        window.location.reload();
      }
      } 
    } else if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); 
      return;
    }
  }

  onCancel() {
    this.userInfo = { ...this.originalUserInfo };

    this.identificationError = null;
    this.lastNameError = null;
    this.nameError = null;
    this.birthDateError = null;
    this.phoneNumberError = null;

    this.cancelEdit.emit();
    this.toggleEdit();
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