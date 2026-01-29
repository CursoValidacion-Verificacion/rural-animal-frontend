import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {AuctionMessage} from "@app/interfaces/auction-message";

/**
 * Servicio para gestionar las conexiones WebSocket para subastas.
 */
@Injectable({
    providedIn: 'root',
})
export class AuctionService {
    private socket!: WebSocket;
    private messages!: Subject<AuctionMessage>;

    constructor() {
    }

    /**
     * Conecta al servidor WebSocket para una subasta especificada.
     *
     * @param auctionId - El identificador de la subasta a la que conectarse.
     * @returns Un Subject que emite objetos AuctionMessage.
     */
    connect(auctionId: number): Subject<AuctionMessage> {
        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket(`ws://localhost:8080/auction-ws?auctionId=${auctionId}`);
        this.messages = new Subject<AuctionMessage>();

        this.socket.onopen = () => {
            this.sendMessage({
                action: 'subscribe',
                publicationId: auctionId
            });
        };

        this.socket.onmessage = (event) => {
            try {
                const data: AuctionMessage = JSON.parse(event.data);
                this.messages.next(data);
            } catch (error) {
                console.error('Error al procesar el mensaje:', error);
            }
        };

        this.socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            this.messages.error(error);
        };

        this.socket.onclose = () => {
            this.messages.complete();
        };

        return this.messages;
    }

    /**
     * Envía un mensaje al servidor WebSocket.
     *
     * @param message - El mensaje a enviar.
     * @param message.action - La acción a realizar.
     * @param message.publicationId - El identificador de la publicación.
     * @param message.userId - Opcional. El identificador del usuario que realiza la acción.
     */
    sendMessage(message: { action: string; publicationId: number; userId?: number }) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket no está abierto');
        }
    }

    /**
     * Desconecta del servidor WebSocket y completa el Subject de mensajes.
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        if (this.messages) {
            this.messages.complete();
        }
    }
}
