import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BaseService } from './base-service';
import { ITransaction, ISearch } from '../interfaces';
import { AlertService } from './alert.service';
import {AuthService} from "@app/services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class BillService extends BaseService<ITransaction> {
  protected override source: string = 'bills';
  private transactionListSignal: WritableSignal<ITransaction[]> = signal([]);
  private transactionSignal: WritableSignal<ITransaction | null> = signal(null);
  private authService: AuthService = inject(AuthService);

  get getTransactions() {
    return this.transactionListSignal.asReadonly();
  }

  transaction$ = this.transactionSignal;

  transactions$ = this.transactionListSignal;

  public search: ISearch = { 
    page: 1,
    size: 5
  }
  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  selectUser() {
    if (
        this.authService.getUser()?.role?.title == "SUPER_ADMIN" ||
        this.authService.getUser()?.role?.title == "ADMIN"
    ) {
      this.getAll();
    } else {
      this.getAllByUser();
    }
  }

  getAll() {
    this.findAllWithParams({
      page: this.search.page,
      size: this.search.size,
    }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
            { length: this.search.totalPages ? this.search.totalPages : 0 },
            (_, i) => i + 1
        );
        this.transactionListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error("error", err);
      },
    });
  }

  getAllByUser() {
    this.findAllWithParamsAndCustomSource(`user/${this.authService.getUser()?.id}`, this.search).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages || 0 },
          (_, i) => i + 1
        );
        
        this.transactionListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getTransactionById(transactionId: number) {
    this.find(transactionId).subscribe({
      next: (response: any) => {
        this.transactionSignal.set(response.data);
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al obtener la transacción. Por favor intenta más tarde",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("error", err);
      },
    });
  }

  delete(transaction: ITransaction) {
    this.delCustomSource(`${transaction.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ha ocurrido un error eliminando una factura.','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  sendEmailBill(transaction: ITransaction) {
    this.addCustomSource('emailBill' ,transaction).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Ha ocurrido un error enviando la factura por correo.','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  downloadBill(transaction: ITransaction) {
    const url = `${this.source}/download-pdf`;
    this.http.post(url, transaction, { responseType: 'blob' }).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'factura.pdf';
        a.click();
        window.URL.revokeObjectURL(url); // Limpieza de memoria
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          'error',
          'Error descargando la factura',
          'center',
          'top',
          ['error-snackbar']
        );
        console.error('Error descargando la factura:', err);
      }
    });
  }
}