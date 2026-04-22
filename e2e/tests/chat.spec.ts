import { test } from '@playwright/test';
import { LoginPage, ChatPage } from '../pages';
import usersData from '../data/users.json';
import chatData from '../data/chat-data.json';

/**
 * Suite de pruebas E2E para chat interactivo.
 * Valida envío de mensajes entre comprador y administrador.
 */
test.describe('Chat Interactivo @chat @e2e', () => {
    let loginPage: LoginPage;
    let chatPage: ChatPage;

    const buyerUser = usersData.validUsers.find(user => user.role === 'BUYER');
    
    test.beforeEach(async ({ page }) => {
        if (!buyerUser) {
            throw new Error('No se encontró un usuario BUYER en users.json');
        }

        loginPage = new LoginPage(page);
        chatPage = new ChatPage(page);

        await loginPage.goto();
        await loginPage.login(buyerUser.email, buyerUser.password);

        await page.waitForURL(/\/app\//, { timeout: 15_000 });
    });

    test('Debe permitir enviar un mensaje en el chat interactivo', async () => {
        await chatPage.goto();
        await chatPage.expectChatVisible();
        await chatPage.sendMessage(`${chatData.buyerToAdmin.message} [${Date.now()}]`);
        await chatPage.expectUserMessage(chatData.buyerToAdmin.message);
    });

    test('Debe recibir una respuesta del asistente después de enviar un mensaje', async () => {
        await chatPage.goto();
        await chatPage.expectChatVisible();
        await chatPage.sendMessage(`${chatData.adminToBuyer.message} [${Date.now()}]`);
        await chatPage.expectUserMessage(chatData.adminToBuyer.message);
        await chatPage.expectAssistantReply();
    });
});
