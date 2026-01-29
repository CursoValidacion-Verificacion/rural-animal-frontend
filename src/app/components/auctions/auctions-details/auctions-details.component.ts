import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IPublication } from "@app/interfaces";
import { LastBid } from "@app/interfaces/last-bid";
import { AnimalStageViewerComponent } from "@app/components/animal/animal-stage-viewer/animal-stage-viewer.component";

/**
 * Componente que representa los detalles de una subasta.
 *
 * Este componente incluye funcionalidades para mostrar la
 * información de la subasta y permitir a los usuarios realizar
 * ofertas. Proporciona métodos para formatear el precio y la
 * fecha, y controla el estado del botón de oferta.
 *
 * Selector: app-auction-details
 *
 * Entradas:
 * - publication: Los detalles de la publicación de la subasta (IPublication).
 * - currentBidAmount: La cantidad de la oferta más alta actual (number).
 * - timeRemaining: El tiempo restante para la subasta (string).
 * - isEndingSoon: Indica si la subasta está por finalizar (boolean).
 * - auctionEnded: Indica si la subasta ha terminado (boolean).
 * - lastBid: La última oferta realizada (LastBid | null).
 *
 * Salidas:
 * - placeBidEvent: Evento que se desencadena cuando se realiza una oferta (EventEmitter<IPublication>).
 */
@Component({
  selector: "app-auction-details",
  standalone: true,
  imports: [CommonModule, AnimalStageViewerComponent],
  templateUrl: "./auctions-details.component.html",
  styleUrls: ["./auctions-details.component.scss"],
})
export class AuctionDetailsComponent {
  @Input() publication!: IPublication;

  currentIndex: number = 0;
  showModelViewer: boolean = false;
  modelPath: string = "";

  // Go to previous image
  prev(): void {
    if (this.publication.photos) {
      this.currentIndex =
        (this.currentIndex - 1 + this.publication.photos.length) %
        this.publication.photos.length;
    }
  }

  // Go to next image
  next(): void {
    if (this.publication.photos) {
      this.currentIndex =
        (this.currentIndex + 1) % this.publication.photos.length;
    }
  }

  // Open the 3D model viewer modal
  openModelViewerModal() {
    const basePath = `../../../../assets/models/${this.publication.specie}/${this.publication.race}`;
    this.modelPath = `${basePath}/adulto.glb`; // Make sure the model exists at this path
    this.showModelViewer = true;
  }

  // Close the model viewer modal
  closeModelViewerModal() {
    this.showModelViewer = false;
  }
  @Input() currentBidAmount: number = 0;
  @Input() timeRemaining: string = "";
  @Input() isEndingSoon: boolean = false;
  @Input() auctionEnded: boolean = false;
  @Input() lastBid: LastBid | null = null;

  @Output() placeBidEvent = new EventEmitter<IPublication>();

  /**
   * formatea el precio para mostrarlo en la UI.
   * @param price el precio a formatear.
   * @returns el precio formateado como cadena.
   */
  public formatPrice(price: number): string {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(price);
  }

  /**
   * formatea la fecha para mostrarla en la UI.
   * @param date la fecha a formatear.
   * @returns la fecha formateada como cadena.
   */
  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("es-CR");
  }

  /**
   * realiza una oferta en la subasta.
   * este método es llamado cuando el usuario decide realizar una
   * oferta y se emite un evento con los detalles de la publicación.
   */
  onPlaceBid(): void {
    this.placeBidEvent.emit(this.publication);
  }

  /**
   * verifica si se puede realizar una oferta.
   * @returns un valor booleano indicando si el botón de oferta debe estar habilitado.
   */
  get canBid(): boolean {
    if (!this.publication?.startDate || !this.publication?.endDate)
      return false;

    const now = new Date().getTime();
    const startDate = new Date(this.publication.startDate).getTime();
    const endDate = new Date(this.publication.endDate).getTime();

    const distanceToStart = startDate - now;
    const distanceToEnd = endDate - now;

    return distanceToStart <= 0 && distanceToEnd > 0;
  }

  /**
   * proporciona el mensaje que debe mostrar el botón de oferta.
   * @returns un mensaje para el botón en función del estado de la subasta.
   */
  get bidButtonMessage(): string {
    if (!this.publication?.startDate || !this.publication?.endDate)
      return "Información de subasta no disponible";

    const now = new Date().getTime();
    const startDate = new Date(this.publication.startDate).getTime();
    const endDate = new Date(this.publication.endDate).getTime();

    const distanceToStart = startDate - now;
    const distanceToEnd = endDate - now;

    if (distanceToStart > 0) {
      return `La subasta inicia el ${this.formatDate(
        this.publication.startDate
      )}`;
    } else if (distanceToEnd <= 0) {
      return "La subasta ha finalizado";
    }
    return "Realizar puja";
  }
}
