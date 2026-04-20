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
    const adminUser = usersData.adminUser;

    test('Debe permitir a un comprador enviar un mensaje al administrador', async ({ page }) => {
        if (!buyerUser) {
            throw new Error('No se encontró un usuario BUYER en users.json');
        }

        loginPage = new LoginPage(page);
        chatPage = new ChatPage(page);

        await loginPage.goto();
        await loginPage.login(buyerUser.email, buyerUser.password);

        await page.waitForURL(/\/app\//, { timeout: 15_000 });

        await chatPage.goto();
        await chatPage.expectChatVisible();
        await chatPage.openConversation(chatData.buyerToAdmin.receiver);
        await chatPage.sendMessage(chatData.buyerToAdmin.message);
        await chatPage.expectLastMessage(chatData.buyerToAdmin.message);
    });

    test('Debe permitir al administrador responder un mensaje', async ({ page }) => {
        if (!adminUser) {
            throw new Error('No se encontró adminUser en users.json');
        }

        loginPage = new LoginPage(page);
        chatPage = new ChatPage(page);

        await loginPage.goto();
        await loginPage.login(adminUser.email, adminUser.password);

        await page.waitForURL(/\/app\//, { timeout: 15_000 });

        await chatPage.goto();
        await chatPage.expectChatVisible();
        await chatPage.openConversation(chatData.adminToBuyer.receiver);
        await chatPage.sendMessage(chatData.adminToBuyer.message);
        await chatPage.expectLastMessage(chatData.adminToBuyer.message);
    });
});