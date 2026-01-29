import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Componente de presentación input para el chat, permite al usuario escribir y enviar mensajes.
 */
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
})
export class ChatInputComponent {
  /** Indica si el chat está en estado de carga y deshabilita el envío de mensajes. */
  @Input() isLoading = false;
  /** Estado de conexión del socket. */
  @Input() connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
  /** Evento que se emite al enviar un mensaje. */
  @Output() onSendMessage = new EventEmitter<string>();
  /** Contenido del mensaje que el usuario está escribiendo. */
  messageContent = '';

  /**
   * Envía el mensaje si hay contenido y el chat no está en estado de carga.
   * Después de enviar el mensaje, limpia el input.
   */
  sendMessage(): void {
    if (this.messageContent.trim() && !this.isLoading) {
      this.onSendMessage.emit(this.messageContent);
      this.messageContent = '';
    }
  }
}
