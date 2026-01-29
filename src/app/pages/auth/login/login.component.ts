import { CommonModule } from "@angular/common";
import { Component, ViewChild, inject, OnInit } from "@angular/core";
import { FormsModule, NgModel, NgForm } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "@app/services/auth.service";
import { UserService } from '@app/services/user.service';
import { ProfileService } from '@app/services/profile.service';
import { ModalService } from '@app/services/modal.service';
import { ModalComponent } from '@app/components/modal/modal.component';

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
  public loginError!: string;
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  private userService: UserService = inject(UserService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  public profileService = inject(ProfileService);
  public modalService: ModalService = inject(ModalService);
  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;
  @ViewChild("restoreEmail") restoreEmailModel!: NgModel;
  showPassword = false;

  public loginForm: { email: string; password: string } = {
    email: "",
    password: "",
  };

  public restoreForm: { restoreEmail: string } = {
    restoreEmail: "",
  };

  constructor() {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const error = params["error"];
      if (error === "auth_failed") {
        this.loginError = "Error durante la autenticación con Google";
      } else if (error === "no_session") {
        this.loginError = "Sesión no válida";
      }
    });
  }

  public handleLogin(event: Event) {
    event.preventDefault();
    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }
    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.login(this.loginForm).subscribe({
        next: () => this.router.navigateByUrl("/app/profile"),
        error: (err: any) => {
          if (err.status === 401) {
            this.loginError = "Correo electrónico o contraseña incorrectos";
          } else if (err.status === 404) {
            this.loginError = "Usuario no encontrado";
          } else if (err.status === 400) {
            this.loginError = "Por favor, verifica tus datos";
          } else {
            this.loginError =
              "Error al iniciar sesión. Por favor, intenta nuevamente";
          }
        },
      });
    }
  }

  public handleRestoreLogin(frm: NgForm, event: Event) {
    event.preventDefault();
  
    if (frm.invalid) {
      frm.control.markAllAsTouched();
    } else {
      this.userService.sendRestoreEmail(this.restoreForm.restoreEmail);
      this.modalService.closeAll();
    }
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
