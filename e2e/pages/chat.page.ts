import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la funcionalidad de chat entre usuarios.
 * Permite abrir conversaciones y enviar mensajes.
 */
export class ChatPage extends BasePage {
    /** Área de entrada de mensaje. */
    readonly messageInput: Locator;
    /** Botón para enviar mensaje. */
    readonly sendButton: Locator;
    /** Contenedor principal de mensajes. */
    readonly chatContainer: Locator;
    /** Estado de conexión del chat. */
    readonly connectionStatus: Locator;
    /** Mensajes del usuario. */
    readonly userMessages: Locator;
    /** Mensajes del asistente. */
    readonly assistantMessages: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.messageInput = page.locator('.input-group input.form-control');
        this.sendButton = page.locator('button.btn-send');
        this.chatContainer = page.locator('.chat-container');
        this.connectionStatus = page.locator('.connection-status');
        this.userMessages = page.locator('.message-row.user .message-content');
        this.assistantMessages = page.locator('.message-row.assistant .message-content');
    }

    /** Navega a la sección de chat. */
    async goto(): Promise<void> {
        await this.navigateTo('/app/chat-bot');
    }

    /**
     * Espera hasta que el websocket del chat esté conectado.
     */
    async waitForConnected(): Promise<void> {
        await expect(this.connectionStatus).toContainText('Conectado', { timeout: 20_000 });
        await expect(this.messageInput).toBeEnabled();
    }

    /**
     * Envía un mensaje dentro de la conversación actual.
     *
     * @param message - Texto del mensaje a enviar.
     */
    async sendMessage(message: string): Promise<void> {
        await this.waitForConnected();
        await this.messageInput.fill(message);
        await this.sendButton.click();
    }

    /**
     * Verifica que exista un mensaje del usuario con el texto enviado.
     *
     * @param message - Texto esperado.
     */
    async expectUserMessage(message: string): Promise<void> {
        await expect(this.userMessages.filter({ hasText: message }).first()).toBeVisible();
    }

    /**
     * Verifica que exista al menos una respuesta del asistente.
     */
    async expectAssistantReply(): Promise<void> {
        await expect(this.assistantMessages.last()).toBeVisible({ timeout: 20_000 });
    }

    /**
     * Verifica que los elementos principales del chat estén visibles.
     */
    async expectChatVisible(): Promise<void> {
        await expect(this.chatContainer).toBeVisible();
        await expect(this.connectionStatus).toBeVisible();
        await expect(this.messageInput).toBeVisible();
        await expect(this.sendButton).toBeVisible();
    }
}
