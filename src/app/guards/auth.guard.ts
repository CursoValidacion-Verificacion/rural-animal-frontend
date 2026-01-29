import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");

  if (sessionId) {
    return true;
  }

  if (!authService.check()) {
    router.navigateByUrl("/login");
    return false;
  }

  return true;
};
