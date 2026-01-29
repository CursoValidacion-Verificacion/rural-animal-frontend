import { CommonModule } from '@angular/common';
import {Component, inject, OnDestroy} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IPayPalRequest } from '@app/interfaces/paypal-request';
import { AgeCalculatorPipe } from '@app/pipes/age-calculator.pipe';
import { AlertService } from '@app/services/alert.service';
import { PayPalService } from '@app/services/paypal.service';
import { ShoppingCartService } from '@app/services/shopping-cart.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: "app-shopping-cart",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AgeCalculatorPipe
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss'
})
export class ShoppingCartComponent implements OnDestroy{
  cartService = inject(ShoppingCartService);
  paypalService = inject(PayPalService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  alertService = inject(AlertService);
  isProcessing = false;
  private destroy$ = new Subject<void>();

  constructor() {
    this.initializePaymentFlow();
  }

  private initializePaymentFlow(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const paymentId = params["paymentId"];
        const PayerID = params["PayerID"];

        if (paymentId && PayerID) {
          this.isProcessing = true;
          this.paypalService
            .executePayment(paymentId, PayerID)
            .pipe(finalize(() => (this.isProcessing = false)))
            .subscribe({
              next: (response) => {

                this.alertService.displayAlert(
                  "success",
                  "Pago procesado exitosamente",
                  "center",
                  "top",
                  ["success-snackbar"]
                );
              },
              error: (error) => {
                console.error("Payment execution error", error);
                this.alertService.displayAlert(
                  "error",
                  "Error al procesar el pago",
                  "center",
                  "top",
                  ["error-snackbar"]
                );
              },
            });
        }
      });
  }

  checkout() {
    const items = this.cartService.getItems()();
    if (items.length) {
      this.isProcessing = true;

      const paymentRequest: IPayPalRequest = {
        publications: items
          .map(item => item.id)
          .filter((id): id is number => id !== undefined)
          .map(id => id.toString())
      };

      this.paypalService
        .createPayment(paymentRequest)
        .pipe(
          finalize(() => {

            this.isProcessing = false;
          })
        )
        .subscribe({
          next: (response: any) => {

            if (response?.data) {

              window.location.href = response.data;
            } else {
              this.alertService.displayAlert(
                "error",
                "Error: No se recibió URL de pago",
                "center",
                "top",
                ["error-snackbar"]
              );
            }
          },
          error: (error) => {
            console.error("Payment creation error:", error);
            this.alertService.displayAlert(
              "error",
              "Error al crear el pago",
              "center",
              "top",
              ["error-snackbar"]
            );
          },
        });
    } else {
      this.alertService.displayAlert(
        "warning",
        "El carrito está vacío",
        "center",
        "top",
        ["warning-snackbar"]
      );
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
