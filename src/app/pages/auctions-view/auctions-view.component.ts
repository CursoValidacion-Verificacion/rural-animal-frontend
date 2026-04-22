import {SweetAlert2Service} from '@app/services/sweet-alert2.service';
import {Component, inject, OnDestroy, OnInit} from "@angular/core";
import {PaginationComponent} from "@app/components/pagination/pagination.component";
import {LoaderComponent} from "@app/components/loader/loader.component";
import {PublicationService} from "@app/services/publication.service";
import {IPublication} from "@app/interfaces";
import {AuctionDetailsComponent} from "@app/components/auctions/auctions-details/auctions-details.component";
import {AuctionsListComponent} from "@app/components/auctions/auctions-list/auctions-list.component";
import {CommonModule} from "@angular/common";
import {Subscription} from "rxjs";
import {AuctionService} from "@app/services/auction.service";
import {AuthService} from "@app/services/auth.service";
import {LastBid} from "@app/interfaces/last-bid";

/**
 * Componente que representa la vista de las subastas.
 *
 * Este componente gestiona la visualización de la lista de subastas
 * y los detalles de una subasta seleccionada, así como la interacción
 * con los servicios de subastas y publicaciones.
 *
 * Selector: app-auctions-view
 */
@Component({
    selector: "app-auctions-view",
    standalone: true,
    imports: [
        CommonModule,
        AuctionDetailsComponent,
        AuctionsListComponent,
        PaginationComponent,
        LoaderComponent,
    ],
    templateUrl: "./auctions-view.component.html",
    styleUrls: ["./auctions-view.component.scss"],
})
export class AuctionsViewComponent implements OnInit, OnDestroy {
    public publicationService: PublicationService = inject(PublicationService);
    public auctionService: AuctionService = inject(AuctionService);
    public authService: AuthService = inject(AuthService);
    public sweetAlert: SweetAlert2Service = inject(SweetAlert2Service)
    public lastBid: LastBid | null = null;

    // Controlar si el componente de lista debe ser visible
    public showList: boolean = true;
    public selectedPublication: IPublication | null = null;

    // estado de la subasta
    public currentBidAmount: number = 0;
    public timeRemaining: string = '';
    public auctionEnded: boolean = false;
    public isEndingSoon: boolean = false;
    private auctionSubscription?: Subscription;
    private timerInterval?: number;

    constructor() {
        this.publicationService.search.page = 1;
        this.publicationService.getAuctionsPublications();
    }


    ngOnInit(): void {
        if (this.selectedPublication) {
            this.initializeAuction();
            this.startAuctionTimer();
            this.connectToAuctionSocket();
        }
    }

    // Controlar la selección y ocultar la lista al seleccionar un detalle
    onViewDetails(publication: IPublication) {
        this.selectedPublication = publication;
        this.showList = false; // Ocultar el componente de lista
        this.initializeAuction();
        this.startAuctionTimer();
        this.connectToAuctionSocket();
        this.lastBid = null;
    }

    // Función para cerrar los detalles y mostrar nuevamente la lista
    closeDetails() {
        this.clearTimer();
        if (this.auctionSubscription) {
            this.auctionSubscription.unsubscribe();
            this.publicationService.getAuctionsPublications();
        }
        this.auctionService.disconnect();
        this.selectedPublication = null;
        this.showList = true; // Mostrar el componente de lista
    }

    /**
     * Inicializa la subasta seleccionada con su monto y verifica su estado.
     */
    private initializeAuction(): void {
        if (this.selectedPublication) {
            this.currentBidAmount = this.selectedPublication.price;
            this.checkAuctionStatus();
        }
    }

    /**
     * Inicia la conexión websocket para la subasta.
     */
    private connectToAuctionSocket(): void {
        if (this.selectedPublication?.id) {
            this.auctionSubscription = this.auctionService
                .connect(this.selectedPublication.id)
                .subscribe({
                    next: (message) => this.handleAuctionMessage(message),
                    error: (error) => console.error('Error en la conexión:', error)
                });
        }
    }

    /**
     * Maneja los mensajes que se envían por websocket.
     * @param message El mensaje recibido.
     */
    private handleAuctionMessage(message: any): void {
        if (message?.action === "bidUpdate") {
            this.currentBidAmount = message.bidAmount;
            this.lastBid = {
                amount: message.bidAmount,
                userId: message.userId,
                bidderName: message.bidderName,
                bidDate: message.bidDate
            };
        } else if (message?.action === "error") {
            const errorMessage = typeof message.message === 'string' && message.message.trim().length > 0
                ? message.message
                : 'No fue posible realizar la puja.';

            console.error('Error del servidor:', errorMessage);
            this.sweetAlert.error('Error al pujar', errorMessage);
        }
    }

    /**
     * Inicia el temporizador de la subasta.
     */
    private startAuctionTimer(): void {
        this.timerInterval = window.setInterval(() => {
            this.updateTimeRemaining();
        }, 1000);
    }

    /**
     * Actualiza el tiempo restante para la subasta.
     */
    private updateTimeRemaining(): void {
        if (!this.selectedPublication?.endDate) return;

        const endDate = new Date(this.selectedPublication.endDate).getTime();
        const now = new Date().getTime();
        const distance = endDate - now;

        if (distance < 0) {
            this.timeRemaining = "Subasta finalizada";
            this.isEndingSoon = true;
            this.clearTimer();
            return;
        }

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.timeRemaining = `finaliza en: ${hours}h ${minutes}m ${seconds}s`;
        this.isEndingSoon = hours === 0 && minutes < 3;
    }

    /**
     * Verifica que la subasta no haya finalizado.
     */
    private checkAuctionStatus(): void {
        if (!this.selectedPublication?.endDate) return;

        const endDate = new Date(this.selectedPublication.endDate).getTime();
        const now = new Date().getTime();
        this.auctionEnded = now > endDate;
    }

    /**
     * Realiza una oferta en la subasta seleccionada.
     * @param publication La publicación en la que se realiza la oferta.
     */
    public async onPlaceBid(publication: IPublication) {
        const userId = this.authService.getUser()?.id;
        if (!userId || !publication?.id) return;

        const confirm = await this.sweetAlert.confirm(
            'Seguro que desea realizar la puja',
            'Una vez realizada la acción, no se puede revertir'
        );

        if (confirm) {
            const bidMessage = {
                action: "placeBid",
                publicationId: publication.id,
                userId: userId
            };

            this.auctionService.sendMessage(bidMessage);
        }
    }

    /**
     * Limpia el temporizador de la subasta.
     */
    private clearTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    /**
     * Ciclo de vida para desuscribirnos y desconectarnos cuando se destruye el componente.
     */
    ngOnDestroy(): void {
        this.clearTimer();
        if (this.auctionSubscription) {
            this.auctionSubscription.unsubscribe();
        }
        this.auctionService.disconnect();
    }
}

