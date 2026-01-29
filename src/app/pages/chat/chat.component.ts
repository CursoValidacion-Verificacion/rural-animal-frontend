import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ChatInputComponent } from '@app/components/chat-bot/chat-input/chat-input.component';
import { ChatMessageComponent } from '@app/components/chat-bot/chat-message/chat-message.component';
import { ChatService } from '@app/services/chat.service';

/**
 * Componente contenedor de chat que permite enviar y recibir mensajes en tiempo real.
 * Gestiona el estado de carga y controla los mensajes del chat.
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent, ChatInputComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnDestroy {
  /** Servicio de chat para enviar y recibir mensajes. */
  private readonly chatService = inject(ChatService);
  /** Estado de carga para indicar si el mensaje está en proceso de envío. */
  private readonly isLoadingSignal = signal(false);
  /** Temporizador para el tiempo máximo de carga. */
  private readonly loadingTimeout = signal<number | undefined>(undefined);
  /** Duración máxima del temporizador de carga en milisegundos. */
  private readonly LOADING_TIMEOUT_DURATION = 3000;
  /** Indica si el chat está en proceso de carga. */
  public readonly isLoading = computed(() => this.isLoadingSignal());
  /** Estado de conexión del socket. */
  public readonly connectionStatus = computed(() => this.chatService.connectionStatus());
  /** Indica si el socket está conectado. */
  public readonly isConnected = computed(() => this.connectionStatus() === 'connected');
  /** Mensajes actuales del chat. */
  public readonly messages = computed(() => this.chatService.messages());

  /**
   * Maneja el envío de un mensaje al chat.
   *
   * @param message El mensaje a enviar.
   */
  handleSendMessage(message: string): void {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || this.isLoading()) return;

    this.startLoading();
    this.chatService.sendMessage(trimmedMessage);
  }

  /**
   * Inicia el estado de carga y establece un temporizador para limitar el tiempo de espera.
   */
  private startLoading(): void {
    this.clearLoadingTimeout();
    this.isLoadingSignal.set(true);

    this.loadingTimeout.set(window.setTimeout(() => this.stopLoading(), this.LOADING_TIMEOUT_DURATION));
  }

  /**
   * Detiene el estado de carga y limpia el temporizador de carga.
   */
  private stopLoading(): void {
    this.isLoadingSignal.set(false);
    this.clearLoadingTimeout();
  }

  /**
   * Limpia el temporizador de carga si está activo.
   */
  private clearLoadingTimeout(): void {
    const currentTimeout = this.loadingTimeout();
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      this.loadingTimeout.set(undefined);
    }
  }

  /**
   * Método de ciclo de vida que se llama cuando el componente se destruye.
   * Limpia el temporizador, desconecta el servicio de chat y borra los mensajes.
   */

  ngOnDestroy(): void {
    this.clearLoadingTimeout();
    this.chatService.disconnect();
    this.chatService.clearMessages();
  }
}
