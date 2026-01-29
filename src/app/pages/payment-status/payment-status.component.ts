import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AlertService } from "@app/services/alert.service";
import { PayPalService } from "@app/services/paypal.service";
import { ShoppingCartService } from "@app/services/shopping-cart.service";
import { finalize } from "rxjs";

@Component({
  selector: "app-payment-status",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./payment-status.component.html",
  styleUrl: "./payment-status.component.scss",
})
export class PaymentStatusComponent {
  private paypalService = inject(PayPalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private cartService = inject(ShoppingCartService);

  isProcessing = false;
  status: "success" | "error" | "cancel" | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const paymentId = params["paymentId"];
      const PayerID = params["PayerID"];

      if (paymentId && PayerID) {
        this.processPayment(paymentId, PayerID);
      } else if (this.route.snapshot.url[0]?.path === "cancel") {
        this.handleCancelledPayment();
      }
    });
  }

  private processPayment(paymentId: string, PayerID: string) {
    this.isProcessing = true;
    this.paypalService
      .executePayment(paymentId, PayerID)
      .pipe(finalize(() => (this.isProcessing = false)))
      .subscribe({
        next: () => {
          this.status = "success";
          this.cartService.clearCart();
          this.alertService.displayAlert(
            "success",
            "Pago procesado exitosamente",
            "center",
            "top",
            ["success-snackbar"]
          );
        },
        error: () => {
          this.status = "error";
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

  private handleCancelledPayment() {
    this.status = "cancel";
    this.alertService.displayAlert("info", "Pago cancelado", "center", "top", [
      "info-snackbar",
    ]);
  }

  navigateToHome() {
    this.router.navigate(["/app/bills"]);
  }

  navigateToCart() {
    this.router.navigate(["/app/shopping-cart"]);
  }

  retryPayment() {
    this.router.navigate(["/app/shopping-cart"]);
  }
}
