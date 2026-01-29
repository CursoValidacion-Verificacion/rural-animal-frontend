import { Injectable, inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { IRoleType } from "../interfaces";

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRoles: IRoleType[] = route.data['authorities'] || [];
    const userHasAccess = allowedRoles.some(role => this.authService.hasRole(role));

    if (!userHasAccess) {
      this.router.navigate(['access-denied']);
      return false;
    }
    return true;
  }
}
