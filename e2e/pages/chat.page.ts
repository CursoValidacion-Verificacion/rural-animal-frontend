import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la funcionalidad de chat entre usuarios.
 * Permite abrir conversaciones y enviar mensajes.
 */
export class ChatPage extends BasePage {
    /** Campo de búsqueda de usuarios o conversaciones. */
    readonly searchUserInput: Locator;
    /** Lista de usuarios o conversaciones disponibles. */
    readonly conversationItems: Locator;
    /** Área de entrada de mensaje. */
    readonly messageInput: Locator;
    /** Botón para enviar mensaje. */
    readonly sendButton: Locator;
    /** Lista o contenedor de mensajes del chat. */
    readonly messageBubbles: Locator;
    /** Título o encabezado del chat actual. */
    readonly chatHeader: Locator;
    /** Mensaje de error del chat, si aplica. */
    readonly errorMessage: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.searchUserInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="usuario"]');
        this.conversationItems = page.locator('.conversation-item, .chat-user, .list-group-item');
        this.messageInput = page.locator('textarea, input[placeholder*="mensaje"]');
        this.sendButton = page.locator('button:has-text("Enviar"), button:has-text("Send")');
        this.messageBubbles = page.locator('.message-bubble, .chat-message, .message');
        this.chatHeader = page.locator('.chat-header, h2, h3');
        this.errorMessage = page.locator('.alert-danger, .text-danger, .error-message');
    }

    /** Navega a la sección de chat. */
    async goto(): Promise<void> {
        await this.navigateTo('/chat');
    }

    /**
     * Busca un usuario y abre la primera conversación encontrada.
     *
     * @param username - Nombre del usuario con quien se desea chatear.
     */
    async openConversation(username: string): Promise<void> {
        await this.searchUserInput.fill(username);
        await this.conversationItems.first().click();
    }

    /**
     * Envía un mensaje dentro de la conversación actual.
     *
     * @param message - Texto del mensaje a enviar.
     */
    async sendMessage(message: string): Promise<void> {
        await this.messageInput.fill(message);
        await this.sendButton.click();
    }

    /**
     * Verifica que el último mensaje visible contenga el texto esperado.
     *
     * @param message - Texto esperado.
     */
    async expectLastMessage(message: string): Promise<void> {
        await expect(this.messageBubbles.last()).toBeVisible();
        await expect(this.messageBubbles.last()).toContainText(message);
    }

    /**
     * Verifica que los elementos principales de la conversación estén visibles.
     */
    async expectChatVisible(): Promise<void> {
        await expect(this.chatHeader).toBeVisible();
        await expect(this.messageInput).toBeVisible();
        await expect(this.sendButton).toBeVisible();
    }
}