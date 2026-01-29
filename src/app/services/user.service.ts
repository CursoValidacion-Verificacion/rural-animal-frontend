import { INotification } from './../interfaces/index';
import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, IUser, IDirection } from '../interfaces';
import { Observable, catchError, tap, throwError, map} from 'rxjs';
import { AlertService } from './alert.service';
//import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})


export class UserService extends BaseService<IUser> {
  protected override source: string = 'users';
  private userListSignal = signal<IUser[]>([]);
  get users$() {
    return this.userListSignal;
  }
  public search: ISearch = { 
    page: 1,
    size: 5
  }
  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);
  //private notificationService: NotificationService = inject(NotificationService);
  

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages: 0}, (_, i) => i+1);
        this.userListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }


  save(user: IUser) {
    this.add(user).subscribe({
      next: (response: any) => {
        const message = 'El usuario fue correctamente registrado, por favor vericar la cuenta por correo electrónico';

        this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
        this.sendAuthenticationEmail(user);
        this.getAll();
      },
      error: (err: any) => {
      this.alertService.displayAlert('error', 'Ocurrió un error al registrar el usuario. Por favor intenta más tarde.', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  saveWithoutGetAll(user: IUser) {
    this.add(user).subscribe({
      next: (response: any) => {
        const message = 'El usuario fue correctamente registrado, por favor iniciar sesión';

        this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
        this.sendAuthenticationEmail(user);
      },
      error: (err: any) => {
      this.alertService.displayAlert('error', 'Ocurrió un error al registrar el usuario. Por favor intenta más tarde.', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(user: IUser) {
    this.patchCustomSource(`${user.id}`, user).subscribe({
      next: (response: any) => {
        const message = 'Información actualizada con éxito';

        this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar el usuario. Por favor intenta más tarde','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  patchUpdate(user: IUser): Observable<any> {
    return this.patchCustomSource(`${user.id}`, user).pipe(
      tap((response: any) => {
        const message = 'Información actualizada con éxito';
        this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
        this.getAll(); 
      }),
      catchError((err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al actualizar el usuario. Por favor intenta más tarde', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
        return throwError(() => err);
      })
    );
  }

  updateUserStatus(user: IUser, newState: "Active" | "Inactive"): Observable<IUser> {
    return this.http.patch<IUser>(`${this.source}/${user.id}`, { state: newState });
  }
  
  delete(user: IUser) {
    this.delCustomSource(`${user.id}`).subscribe({
      next: (response: any) => {
        const message = 'Usuario eliminado con éxito';
        this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ocurrió un error al eliminar el usuario. Por favor intenta más tarde','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  sendAuthenticationEmail(user: IUser) {
    this.addCustomSource("authenticate", user).subscribe({
      next: (response: any) => {
        const message = 'El correo fue correctamente enviado';

        this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
      this.alertService.displayAlert('error', 'Ocurrió un error al enviar el correo. Por favor intenta más tarde.', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  sendRestoreEmail(usermail: string) {
    this.addCustomSource("forgotPassword", usermail).subscribe({
      next: (response: any) => {
        const message = 'El correo fue correctamente enviado';

        this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
      },
      error: (err: any) => {
      this.alertService.displayAlert('error', 'Ocurrió un error al enviar el correo. Por favor intenta más tarde.', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
  
  filterUsers(keyword: string) {
    this.findAllWithParamsAndCustomSource(`filter`, {
      page: this.search.page,
      size: this.search.size,
      keyword: keyword
    }).subscribe({
      next: (response: any) => {
        this.search = { 
          ...this.search, 
          ...response.meta,
          pageNumber: response.meta.pageNumber,
        };
        this.totalItems = Array.from(
          { length: this.search.totalPages || 0 },
          (_, i) => i + 1
        );
        
        this.userListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al filtrar usuarios: ', err);
      }
    });
  }
}
