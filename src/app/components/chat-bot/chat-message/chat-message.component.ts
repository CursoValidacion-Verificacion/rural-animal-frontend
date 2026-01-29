import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IChatMessage } from '@app/interfaces/chat-message';

/**
 * Componente de presentación que representa un mensaje individual en el chat.
 */
@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {

  /** Mensaje a mostrar en el chat, de tipo `IChatMessage`. */
  @Input({ required: true }) message!: IChatMessage;
  /** Indica si el mensaje está en proceso de carga. */
  @Input() isLoading = false;
}
