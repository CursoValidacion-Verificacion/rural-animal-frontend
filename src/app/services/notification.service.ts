import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BaseService } from './base-service';
import { INotification, ISearch, IUser } from '../interfaces';
import { tap } from 'rxjs/operators';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseService<INotification> {
  protected override source: string = 'notifications';
  private notificationListSignal: WritableSignal<INotification[]> = signal([]);

  get getNotifications() {
    return this.notificationListSignal.asReadonly();
  }

  public search: ISearch = { 
    page: 1,
    size: 10
  }
  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAllByUser(userId: number) {
    this.findAllWithParamsAndCustomSource(`${userId}`, this.search).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages || 0 },
          (_, i) => i + 1
        );
        
        this.notificationListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getAllActiveByUser(userId: number) {
    this.find(`${userId}`).subscribe({
      next: (response: any) => {
        this.notificationListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(userId: number, notification: INotification) {
    this.addCustomSource(`${userId}`, notification).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAllByUser(userId);
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al agregar la notificación','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(notification: INotification) {
    this.editCustomSource(`${notification.id}`, notification).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar la notificación','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(notification: INotification) {
    this.delCustomSource(`${notification.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al eliminar la notificación','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  updateNotificationStatus(notification: INotification) {
    let tmpUser  = notification.user;
    notification.user = {
      id: tmpUser.id
    };
    this.patch(notification.id, notification).subscribe({
      next: () => {
        console.log(`Notification ${notification.id} marked as Inactive`);
      },
      error: (err) => {
        console.error('No se pudo actualizar el estado de la notificación', err);
      }
    });
  }

}
