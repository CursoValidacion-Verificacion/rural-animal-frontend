import { Component, OnInit, inject, computed,Signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { INotification } from "@app/interfaces";
import { AuthService } from "../../services/auth.service";
import { NotificationService } from "../../services/notification.service";
import { Observable } from 'rxjs';

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: "./notifications.component.html",
})
export class NotificationsComponent implements OnInit {
  public notifications: Signal<INotification[]>; // Cambiado a Signal
  public notificationCount: Signal<number>;
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  constructor(public router: Router) {
    this.notifications = computed(() =>
    this.notificationService
      .getNotifications()
      .slice()
      .filter(notification => notification.state === "Active")
      .sort((a, b) => new Date(b.creationDate!).getTime() - new Date(a.creationDate!).getTime())
    );
    this.notificationCount = computed(() => this.notifications().length);
  }

  ngOnInit() {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userId = this.authService.getUser()?.id;
      if (userId) {
        this.notificationService.getAllActiveByUser(userId);
      }
    }
  }

  handdleNotification(notification: INotification) {
    notification.state = "Inactive";
    this.notificationService.updateNotificationStatus(notification);
  }
}
