import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { LayoutService } from '../../../../services/layout.service';
import { MyAccountComponent } from '../../../my-account/my-account.component';
import { NotificationsComponent } from '../../../notifications/notifications.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MyAccountComponent, NotificationsComponent],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent implements OnInit {

  constructor(
    public router: Router,
    public layoutService: LayoutService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
