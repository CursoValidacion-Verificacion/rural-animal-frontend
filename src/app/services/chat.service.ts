import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { IChatMessage } from "@app/interfaces/chat-message";
import { catchError } from "rxjs";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { environment } from "src/environments/environment";
import {ChatMessagePayload} from "@app/interfaces/chat-message-payload";
import {AuthService} from "@app/services/auth.service";

/**
 * Servicio de chat para gestionar la conexión WebSocket, enviar y recibir mensajes,
 * y manejar el estado de conexión.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private authService: AuthService = inject(AuthService);
  /** Referencia para destruir la conexión al destruir el servicio. */
  private destroyRef = inject(DestroyRef);
  /** Objeto WebSocket para gestionar la conexión. */
  private socket$: WebSocketSubject<any> | null = null;
  /** URL del endpoint WebSocket. */
  private readonly WS_ENDPOINT = `ws://${environment.webSocketUrl}/chat`;
  /** Señal que mantiene el historial de mensajes del chat. */
  private messagesSignal = signal<IChatMessage[]>([]);
  /** Señal que indica el estado de la conexión: 'connected', 'disconnected' o 'error'. */
  private connectionStatusSignal = signal<'connected' | 'disconnected' | 'error'>('disconnected');
  /** Computed para acceder al historial de mensajes del chat. */
  public messages = computed(() => this.messagesSignal());
  /** Computed para obtener el estado actual de la conexión. */
  public connectionStatus = computed(() => this.connectionStatusSignal());

  constructor() {
    this.connect();
  }

  /**
  * Establece la conexión WebSocket y configura el manejo de mensajes entrantes,
  * el estado de conexión y la reconexión en caso de error.
  */
  private connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: this.WS_ENDPOINT,
        deserializer: (e: MessageEvent) => {
          try {
            return JSON.parse(e.data);
          } catch {
            return e.data;
          }
        }
      });

      this.socket$.pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Error en el socket:', error);
          this.connectionStatusSignal.set('error');
          return EMPTY;
        })
      ).subscribe({
        next: (message: any) => {
          const newMessage: IChatMessage = {
            content: typeof message === 'string' ? message : message.content,
            role: 'assistant',
            timestamp: new Date()
          };
          this.messagesSignal.update(messages => [...messages, newMessage]);
        },
        error: () => {
          this.connectionStatusSignal.set('error');
          this.reconnect();
        },
        complete: () => {
          this.connectionStatusSignal.set('disconnected');
          this.reconnect();
        }
      });

      this.connectionStatusSignal.set('connected');
    }
  }

  /**
  * Intenta reconectar el WebSocket después de un tiempo de espera.
  */
  private reconnect(): void {
    setTimeout(() => {
      this.connect();
    }, 5000);
  }

  /**
  * Envía un mensaje a través del WebSocket.
  * Si la conexión no está disponible, muestra un mensaje de error.
  *
  * @param content Contenido del mensaje a enviar.
  */
  public sendMessage(content: string): void {
    if (this.socket$ && this.connectionStatusSignal() === 'connected') {
      const userMessage: IChatMessage = {
        content,
        role: 'user',
        timestamp: new Date()
      };
      this.messagesSignal.update(messages => [...messages, userMessage]);

      const payload: ChatMessagePayload={
        content: content,
        userId: this.authService.getUser()?.id ?? 0
      }

      this.socket$.next(payload);
    } else {
      const errorMessage: IChatMessage = {
        content: 'Error: No se pudo enviar el mensaje, conexión no disponible',
        role: 'assistant',
        timestamp: new Date()
      };
      this.messagesSignal.update(messages => [...messages, errorMessage]);
    }
  }

  /**
     * Cierra la conexión WebSocket y actualiza el estado de la conexión a 'disconnected'.
     */
  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
      this.connectionStatusSignal.set('disconnected');
    }
  }

  /**
     * Limpia el historial de mensajes del chat.
     */
  public clearMessages(): void {
    this.messagesSignal.set([]);
  }
}