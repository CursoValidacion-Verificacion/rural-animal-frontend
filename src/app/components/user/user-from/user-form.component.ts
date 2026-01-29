import { AlertService } from "@app/services/alert.service";
import { AuthService } from "@app/services/auth.service";
import { UserService } from "@app/services/user.service";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnInit,
} from "@angular/core";
import { IUser, Canton, Province, District } from "@app/interfaces";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  FormControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AddressFormComponent } from "../../address-forms/address-forms.component";
import { AddressService } from "@app/services/address.service";

@Component({
  selector: "app-user-form",
  standalone: true,

  imports: [ReactiveFormsModule, CommonModule, AddressFormComponent],
  templateUrl: "./user-form.component.html",
  styleUrl: "./user-form.component.scss",
})
export class UserFormComponent implements OnInit {
  @Input() userForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() callUpdateMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() cancelAction: EventEmitter<void> = new EventEmitter<void>();
  public emailError: string | null = null;
  private addressService = inject(AddressService);
  addressForm!: FormGroup;
  provinces: Province[] = [];
  cantons: Canton[] = [];
  districts: District[] = [];
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.userForm = this.fb.group(
      {
        email: ["", [Validators.required, this.emailValidator]],
        name: ["", Validators.required],
        lastName1: ["", Validators.required],
        lastName2: [""],
        identification: ["", Validators.required],
        vco: ["", Validators.required],
        birthDate: ["", [Validators.required, this.ageValidator]],
        phoneNumber: ["", Validators.required],
        role: this.fb.group({
          title: [""],
        }),
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
        validators: Validators.required,
      }),
    });
  }

  async ngOnInit() {
    this.provinces = await this.addressService.getProvinces();
  }

  // Método para limpiar el error del campo específico
  clearError(fieldName: string) {
    const control = this.userForm.get(fieldName);
    if (control) {
      control.setErrors(null); // Resetea los errores
    }
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
        (age === 18 &&
          (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))
      ) {
        return { age: true }; // Menor de 18 años
      }

      return null; // Mayor de 18 años
    };
  }

  // Validador del formato de correo electrónico
  private emailValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const emailRegex =
      /^(?!.*[_.-]{2})(?!.*[.-]$)(?!^.*[.-])(?=.{1,254}$)([a-zA-Z0-9._-]+)@[a-zA-Z]+(\.[a-zA-Z]{2,6})(?!.*\s)[a-zA-Z0-9.-]*$/;

    if (!control.value) {
      return null; // Si no hay valor, no hay error
    }

    const isValidFormat = emailRegex.test(control.value);
    const domainPart = control.value.split("@")[1];

    if (!isValidFormat) {
      return { invalidEmail: true }; // Error si no coincide con el formato
    }

    if (domainPart) {
      const domainParts = domainPart.split(".");
      if (domainParts.length < 2) {
        return { email: true }; // Error si no hay al menos un punto
      }
      const extension = domainParts[domainParts.length - 1];
      if (/\d/.test(extension)) {
        return { email: true }; // Error si la extensión tiene números
      }
    }

    return null; // Retorna null si no hay errores
  }

  onEmailChange(event: any) {
    console.log("Email changed:", event.target.value);

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
    let user: IUser = {
      email: this.userForm.controls["email"].value,
      name: this.userForm.controls["name"].value,
      lastName1: this.userForm.controls["lastName1"].value,
      lastName2: this.userForm.controls["lastName2"]?.value,
      identification: this.userForm.controls["identification"].value,
      vco: this.userForm.controls["vco"]?.value,
      birthDate: this.userForm.controls["birthDate"].value,
      phoneNumber: this.userForm.controls["phoneNumber"].value,
      role: {
        title: this.userForm.controls["role"].value,
      },
      password: this.userForm.controls["password"].value,
      direction: {
        province: this.addressForm.get("province")?.value,
        canton: this.addressForm.get("canton")?.value,
        district: this.addressForm.get("district")?.value,
        otherDetails: this.addressForm.get("otherDetails")?.value,
      },
    };

    if (this.userForm.controls["id"]?.value) {
      user.id = this.userForm.controls["id"].value;
    }

    // Eventos para guardar o actualizar
    if (user.id) {
      this.callUpdateMethod.emit(user);
    } else {
      this.callSaveMethod.emit(user);
      this.userForm.reset();
    }
  }

  onCancel() {
    this.cancelAction.emit();
    this.userForm.reset();
    this.addressForm.reset();
    this.router.navigate(["/users"]);
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
