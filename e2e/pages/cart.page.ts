import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la funcionalidad del carrito de compras.
 * Permite buscar productos, agregarlos al carrito, visualizar el contenido
 * y eliminar elementos.
 */
export class CartPage extends BasePage {
    /** Campo de búsqueda de productos. */
    readonly searchInput: Locator;
    /** Lista o grid de productos. */
    readonly productCards: Locator;
    /** Botones para agregar productos al carrito. */
    readonly addToCartButtons: Locator;
    /** Ícono o enlace para abrir el carrito. */
    readonly cartButton: Locator;
    /** Contador visual de productos en el carrito. */
    readonly cartBadge: Locator;
    /** Filas o tarjetas de productos dentro del carrito. */
    readonly cartItems: Locator;
    /** Botones para eliminar productos del carrito. */
    readonly removeButtons: Locator;
    /** Mensaje que indica que el carrito está vacío. */
    readonly emptyCartMessage: Locator;
    /** Mensaje de confirmación al agregar producto. */
    readonly successMessage: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
        this.productCards = page.locator('.product-card, .card');
        this.addToCartButtons = page.locator('button:has-text("Agregar al carrito"), button:has-text("Add to cart")');
        this.cartButton = page.locator('a[href*="cart"], button:has(.fa-shopping-cart), .cart-btn');
        this.cartBadge = page.locator('.cart-badge, .badge, .cart-count');
        this.cartItems = page.locator('.cart-item, .cart-row, tbody tr');
        this.removeButtons = page.locator('button:has-text("Eliminar"), button:has-text("Remove")');
        this.emptyCartMessage = page.locator('text=/carrito.*vac[ií]o|cart is empty/i');
        this.successMessage = page.locator('.alert-success, .toast-success, .success-message');
    }

    /** Navega a la página de productos o tienda. */
    async gotoShop(): Promise<void> {
        await this.navigateTo('/shop');
    }

    /** Navega directamente a la página del carrito. */
    async gotoCart(): Promise<void> {
        await this.navigateTo('/cart');
    }

    /**
     * Busca un producto por nombre.
     *
     * @param productName - Nombre del producto a buscar.
     */
    async searchProduct(productName: string): Promise<void> {
        await this.searchInput.fill(productName);
    }

    /**
     * Agrega el primer producto visible al carrito.
     */
    async addFirstProductToCart(): Promise<void> {
        await this.addToCartButtons.first().click();
    }

    /**
     * Busca un producto y agrega el primero de los resultados al carrito.
     *
     * @param productName - Nombre del producto a agregar.
     */
    async searchAndAddProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.addFirstProductToCart();
    }

    /**
     * Abre la vista del carrito.
     */
    async openCart(): Promise<void> {
        await this.cartButton.click();
    }

    /**
     * Elimina el primer producto del carrito.
     */
    async removeFirstItem(): Promise<void> {
        await this.removeButtons.first().click();
    }

    /**
     * Verifica que exista al menos un producto en el carrito.
     */
    async expectCartHasItems(): Promise<void> {
        await expect(this.cartItems.first()).toBeVisible();
    }

    /**
     * Verifica que el carrito esté vacío.
     */
    async expectEmptyCart(): Promise<void> {
        await expect(this.emptyCartMessage).toBeVisible();
    }

    /**
     * Verifica que se muestre un mensaje de éxito al agregar un producto.
     *
     * @param message - Texto esperado del mensaje.
     */
    async expectSuccessMessage(message: string): Promise<void> {
        await expect(this.successMessage).toBeVisible();
        await expect(this.successMessage).toContainText(message);
    }
}