import { Component, inject, ViewChild } from "@angular/core";
import { PublicationsListComponent } from "../../components/publication/publications-list/publications-list.component";
import { PaginationComponent } from "@app/components/pagination/pagination.component";
import { LoaderComponent } from "@app/components/loader/loader.component";
import { PublicationService } from "@app/services/publication.service";
import { ModalService } from "@app/services/modal.service";
import { FormBuilder, Validators } from "@angular/forms";
import { IPublication } from "@app/interfaces";
import { PublicationsFormComponent } from "@app/components/publication/publications-form/publications-form.component";
import { SalesDetailsComponent } from "@app/components/sales/sales-details/sales-details.component";
import { SalesListComponent } from "@app/components/sales/sales-list/sales-list.component";
import { CommonModule } from "@angular/common";
import { ShoppingCartService } from "@app/services/shopping-cart.service";
import { Router } from "@angular/router";
import { AlertService } from "@app/services/alert.service";
@Component({
  selector: "app-sales-view",
  standalone: true,
  imports: [
    CommonModule,
    SalesDetailsComponent,
    SalesListComponent,
    PaginationComponent,
    LoaderComponent,
  ],
  templateUrl: "./sales-view.component.html",
  styleUrls: ["./sales-view.component.scss"],
})
export class SalesViewComponent {
  public publicationService: PublicationService = inject(PublicationService);
  public showForm: boolean = false;
  private cartService = inject(ShoppingCartService);
  private router = inject(Router);
  private alertService: AlertService = inject(AlertService);

  // Controlar si el componente de lista debe ser visible
  public showList: boolean = true; // Por defecto el componente de lista está visible
  public selectedPublication: IPublication | null = null;

  constructor() {
    this.publicationService.search.page = 1;
    this.publicationService.getSalesPublications();
  }

  // Controlar la selección y ocultar la lista al seleccionar un detalle
  onViewDetails(publication: IPublication) {
    this.selectedPublication = publication;
    this.showList = false; // Ocultar el componente de lista
  }

  // Función para cerrar los detalles y mostrar nuevamente la lista
  closeDetails() {
    this.selectedPublication = null;
    this.showList = true; // Mostrar el componente de lista
  }

  isPublicationInCart(publication: IPublication): boolean {
    return this.cartService.getItems()().some(item => item.id === publication.id);
  }

  addToCart(publication: IPublication): void {
    this.cartService.addItem(publication);
    this.alertService.displayAlert('success', 'Publicación agregada correctamente', 'center', 'top', ['success-snackbar']);
  }

  navigateToCart(): void {
    this.router.navigate(['app/shopping-cart']);
  }
}
