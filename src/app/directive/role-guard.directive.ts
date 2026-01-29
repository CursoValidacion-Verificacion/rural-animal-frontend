import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appRoleGuard]',
  standalone: true
})
export class RoleGuardDirective implements OnInit {
  private element: ElementRef<HTMLElement> = inject(ElementRef);
  private authService: AuthService = inject(AuthService);

  @Input() superAdminOnly = false;
  @Input() appRoleGuard = '';

  ngOnInit() {
    if (this.superAdminOnly) {
      if (!this.authService.isSuperAdmin()) {
        this.element.nativeElement.remove();
      }
      return;
    }

    if (this.appRoleGuard && !this.authService.hasRole(this.appRoleGuard)) {
      this.element.nativeElement.remove();
    }
  }
}