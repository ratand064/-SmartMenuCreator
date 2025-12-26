import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../components/skeleton-loader/skeleton-loader.component';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, 
  IonItem, IonLabel, IonButton, IonIcon, 
  IonSpinner, IonList, IonThumbnail, IonFooter,
  AlertController,IonButtons
} from '@ionic/angular/standalone';

import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast';
import { addIcons } from 'ionicons';
import { trash, add, remove, logoWhatsapp, bagCheck } from 'ionicons/icons';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    SkeletonLoaderComponent, 
    IonContent, IonHeader, IonToolbar, IonTitle, 
    IonItem, IonLabel, IonButton, IonIcon,
    IonList, IonThumbnail,IonButtons
  ]
})
export class CartPage implements OnInit {
  cart: any = null;
  loading: boolean = false;

  constructor(
    private api: ApiService,
    public cartService: CartService,
    private toast: ToastService,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    addIcons({ trash, add, remove, 'logo-whatsapp': logoWhatsapp, 'bag-check': bagCheck });
  }

  ngOnInit() {
    this.loadCart();
  }

  ionViewWillEnter() {
    this.loadCart();
  }

  goToMenu() {
    this.router.navigate(['/tabs/menu']);
  }

  loadCart() {
    this.loading = true;
    this.api.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.data;
          this.recalculateTotal(); 
          this.cartService.updateCartCount(this.cart.items.length);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load cart');
      }
    });
  }

  updateQuantity(itemId: string, action: 'add' | 'remove', currentQty: number) {
    if (action === 'remove' && currentQty <= 1) {
      this.removeItem(itemId);
      return;
    }

    const item = this.cart.items.find((i: any) => i.menuItem._id === itemId);
    
    if (item) {
      let newQty = Number(item.quantity);
      if (action === 'add') {
        newQty += 1;
        this.toast.success('Quantity increased! ➕');
      } else {
        newQty -= 1;
        this.toast.info('Quantity decreased ➖');
      }
      
      item.quantity = newQty;
      this.recalculateTotal();
    }
  }

  recalculateTotal() {
    if (!this.cart || !this.cart.items) return;

    const total = this.cart.items.reduce((acc: number, item: any) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || Number(item.menuItem?.price) || 0;
      return acc + (qty * price);
    }, 0);

    this.cart.totalPrice = total;
  }

  removeItem(menuItemId: string) {
    if (menuItemId === 'all') {
       this.api.clearCart().subscribe(res => {
         if(res.success) {
           this.cart = { items: [], totalPrice: 0 };
           this.cartService.updateCartCount(0);
           this.toast.success('Cart cleared! 🗑️');
         }
       });
       return;
    }

    this.api.removeFromCart(menuItemId).subscribe({
      next: (res) => {
        if (res.success) {
          this.cart.items = this.cart.items.filter((i: any) => i.menuItem._id !== menuItemId);
          this.recalculateTotal();
          this.cartService.updateCartCount(this.cart.items.length);
          this.toast.success('Item removed from cart 🗑️');
        }
      },
      error: () => {
        this.toast.error('Failed to remove item');
      }
    });
  }

  checkoutViaWhatsApp() {
    if (!this.cart || this.cart.items.length === 0) {
      this.toast.error('Cart is empty! Add items first 🛒');
      return;
    }

    let message = "Hi! I'd like to place an order via YumBlock:\n\n";
    this.cart.items.forEach((item: any, index: number) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || Number(item.menuItem?.price) || 0;
      message += `${index + 1}. ${item.menuItem.title} x ${qty} - ₹${price * qty}\n`;
    });
    
    message += `\n *Grand Total: ₹${this.cart.totalPrice}*`;
    message += `\n Please confirm my order!`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    this.toast.success('Opening WhatsApp... 💬');
  }
}