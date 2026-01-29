import { inject, Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { IPayPalRequest } from '@app/interfaces/paypal-request';
import { IPayPalResponse } from '@app/interfaces/paypal-response';
import { AlertService } from './alert.service';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayPalService extends BaseService<IPayPalResponse> {
  protected override source: string = 'paypal';
  private alertService: AlertService = inject(AlertService);
  private router: Router = inject(Router);

  createPayment(paymentRequest: IPayPalRequest): Observable<any> {
    return this.add(paymentRequest).pipe(
      tap({
        next: (response: any) => {
          console.log('PayPal response:', response);
          if (response.data) {
            window.location.href = response.data;
          }
        },
        error: (error) => {
          this.handleError('Error al procesar el pago');
          console.error('PayPal error:', error);
        }
      }),
      catchError(error => {
        this.handleError('Error al procesar el pago');
        return throwError(() => error);
      })
    );
  }

  executePayment(paymentId: string, PayerID: string): Observable<any> {
    const params = { paymentId, PayerID };

    return this.findAllWithParamsAndCustomSource('success', params).pipe(
      tap({
        next: () => {
          this.handleSuccess('Pago procesado exitosamente');
        },
        error: () => {
          this.handleError('Error al confirmar el pago');
        }
      })
    );
  }

  cancelPayment(): Observable<any> {
    return this.findAll().pipe(
      tap({
        next: () => {
          this.handleCancel('Pago cancelado');
        },
        error: () => {
          this.handleError('Error al cancelar el pago');
        }
      })
    );
  }

  private handleSuccess(message: string): void {
    this.alertService.displayAlert('success', message, 'center', 'top', ['success-snackbar']);
    this.router.navigate(['/app/paypal/success']);  
  }

  private handleError(message: string): void {
    this.alertService.displayAlert('error', message, 'center', 'top', ['error-snackbar']);
    this.router.navigate(['/app/paypal/error']);
  }

  private handleCancel(message: string): void {
    this.alertService.displayAlert('info', message, 'center', 'top', ['info-snackbar']);
    this.router.navigate(['/app/paypal/cancel']);
  }
}