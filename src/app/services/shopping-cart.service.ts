import { Injectable, signal } from "@angular/core";
import { IPublication } from "@app/interfaces";

@Injectable({
  providedIn: "root",
})
export class ShoppingCartService {
  private readonly STORAGE_KEY = "shopping_cart";
  private cartItems = signal<IPublication[]>([]);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedItems = localStorage.getItem(this.STORAGE_KEY);
    if (storedItems) {
      this.cartItems.set(JSON.parse(storedItems));
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems()));
  }

  getItems() {
    return this.cartItems.asReadonly();
  }

  addItem(item: IPublication): void {
    const currentItems = this.cartItems();
    if (!currentItems.some((cartItem) => cartItem.id === item.id)) {
      this.cartItems.set([...currentItems, item]);
      this.saveToLocalStorage();
    }
  }

  removeItem(itemId: number): void {
    const currentItems = this.cartItems();
    this.cartItems.set(currentItems.filter((item) => item.id !== itemId));
    this.saveToLocalStorage();
  }

  clearCart(): void {
    this.cartItems.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getTotal(): number {
    return this.cartItems().reduce((total, item) => total + item.price, 0);
  }

  getItemCount(): number {
    return this.cartItems().length;
  }
}
