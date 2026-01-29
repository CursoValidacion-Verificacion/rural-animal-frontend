import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IUser } from '../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService<IUser> {
  protected override source: string = 'users/me';
  public userSignal = signal<IUser>({});
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);

  get user$() {
    return this.userSignal;
  }

  getUserInfoSignal() {
    return new Promise((resolve, reject) => {
      this.findAll().subscribe({
        next: (response: any) => {
          this.userSignal.set(response);
          resolve(response);
        },
        error: (error: any) => {
          this.snackBar.open(
            `Error al obtener la información del usuario: ${error.message}`,
            'Close',
            {
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            }
          );
          reject(error);
        }
      });
    });
  }

  updateUserInfo(user: IUser) {
    return new Promise((resolve, reject) => {
      this.userService.patchUpdate(user).subscribe({
        next: (response: any) => {
          this.userSignal.set(response);
          resolve(response);
        },
        error: (error: any) => {
          this.snackBar.open(
            `Error al actualizar el usuario: ${error.message}`,
            'Close',
            {
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            }
          );
          reject(error);
        }
      });
    });
  }
}