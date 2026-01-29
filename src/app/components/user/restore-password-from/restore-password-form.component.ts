import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnInit,
} from "@angular/core";
import { IUser} from "@app/interfaces";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@app/services/auth.service";

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: "app-restore-password-form",
  standalone: true,

  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./restore-password-form.component.html",
  styleUrl: "./restore-password-form.component.scss",
})
export class RestorePasswordFormComponent implements OnInit {
  @Input() userForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() callUpdateMethod: EventEmitter<IUser> = new EventEmitter<IUser>();
  @Output() cancelAction: EventEmitter<void> = new EventEmitter<void>();
  private authService = inject(AuthService);
  public user?: IUser;
  oldPasswordVisible: boolean = false;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.userForm = this.fb.group(
      {
        oldPassword: ["", Validators.required, [this.oldPasswordValidator()]],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  async ngOnInit() {
    this.user = this.authService.getUser();
  }

  // Método para limpiar el error del campo específico
  clearError(fieldName: string) {
    const control = this.userForm.get(fieldName);
    if (control) {
      control.setErrors(null); // Resetea los errores
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const oldPassword = form.get("oldPassword")?.value;
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  toggleOldPasswordVisibility() {
    this.oldPasswordVisible = !this.oldPasswordVisible;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  callSave() {
    let newUserInfo: IUser = {
      password: this.userForm.controls["password"].value,
      id: this.userForm.controls["id"].value,
    };

    this.callSaveMethod.emit(newUserInfo);
    this.userForm.reset();
  }

  private oldPasswordValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const storedPasswordHash = this.user?.password;
  
      if (!storedPasswordHash) {
        console.error('No se encontró la contraseña almacenada');
        return of({ oldPassword: true });
      }
  
      return new Observable<ValidationErrors | null>((observer) => {
        this.authService.verifyPassword(control.value, storedPasswordHash, (isMatch) => {
          if (!isMatch) {
            observer.next({ oldPassword: true });
          } else {
            observer.next(null);
          }
          observer.complete();
        });
      }).pipe(
        catchError(() => of({ oldPassword: true }))
      );
    };
  }

  onCancel() {
    this.cancelAction.emit();
    this.userForm.reset();
    this.router.navigate(["/users"]);
  }
}
