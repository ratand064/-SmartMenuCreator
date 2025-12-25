import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class CartPage implements OnInit {
  cart: any = null;
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private toast: ToastService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  ionViewWillEnter() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.api.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.data;
          this.cartService.updateCartCount(this.cart.items.length);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Cart Error:', err);
        this.toast.error('Failed to load cart');
        this.loading = false;
      }
    });
  }

  removeItem(menuItemId: string) {
    this.api.removeFromCart(menuItemId).subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.data;
          this.cartService.updateCartCount(this.cart.items.length);
          this.toast.success('Item removed!');
        }
      },
      error: (err) => {
        console.error('Remove Error:', err);
        this.toast.error('Failed to remove item');
      }
    });
  }

  async clearCart() {
    const alert = await this.alertCtrl.create({
      header: 'Clear Cart',
      message: 'Are you sure you want to clear entire cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            this.api.clearCart().subscribe({
              next: (res) => {
                if (res.success) {
                  this.cart = { items: [], totalPrice: 0 };
                  this.cartService.updateCartCount(0);
                  this.toast.success('Cart cleared!');
                }
              },
              error: (err) => {
                console.error('Clear Error:', err);
                this.toast.error('Failed to clear cart');
              }
            });
          }
        }
      ]
    });
    
    await alert.present();
  }

  checkout() {
    this.toast.info(`Total: ₹${this.cart.totalPrice} - Checkout coming soon!`);
  }
}