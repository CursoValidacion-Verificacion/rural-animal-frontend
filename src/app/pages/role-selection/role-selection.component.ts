import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-role-selection",
  standalone: true,
  imports: [],
  templateUrl: "./role-selection.component.html",
  styleUrl: "./role-selection.component.scss",
})
export class RoleSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  sessionId: string = "";
  errorMessage: string = "";

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.sessionId = params["session"];
      if (!this.sessionId) {
        this.router.navigateByUrl("/login").then();
      }
    });
  }

  selectRole(role: string) {
    if (!this.sessionId) {
      this.router.navigateByUrl("/login").then();
      return;
    }

    this.authService.completeRegistration(this.sessionId, role).subscribe({
      next: () => {
        this.router.navigateByUrl("/app/profile").then();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          "Error al seleccionar el rol. Por favor, intenta de nuevo.";
        setTimeout(() => {
          this.router
            .navigateByUrl("/login?error=role_selection_failed")
            .then();
        }, 3000);
      },
    });
  }
}
