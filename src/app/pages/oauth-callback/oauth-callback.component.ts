import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-oauth-callback",
  standalone: true,
  imports: [],
  templateUrl: "./oauth-callback.component.html",
  styleUrl: "./oauth-callback.component.scss",
})
export class OauthCallbackComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  constructor() {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const sessionId = params["session"];
      const error = params["error"];
      const needsRoleSelection = params["needsRoleSelection"];

      if (error) {
        this.handleError(error);
        return;
      }

      if (sessionId) {
        if (needsRoleSelection === "true") {
          this.router
            .navigateByUrl(`/role-selection?session=${sessionId}`)
            .then();
          return;
        }

        this.authService.handleGoogleCallback(sessionId).subscribe({
          next: () => {
            this.router.navigateByUrl("/app/profile").then();
          },
          error: (error) => {
            this.handleError(error.error?.message);
          },
        });
      } else {
        this.router.navigateByUrl("/login?error=no_session").then();
      }
    });
  }

  private handleError(error: string) {
    switch (error) {
      case "invalid_role":
        this.router.navigateByUrl("/login?error=invalid_role").then();
        break;
      default:
        this.router.navigateByUrl("/login?error=auth_failed").then();
    }
  }
}
