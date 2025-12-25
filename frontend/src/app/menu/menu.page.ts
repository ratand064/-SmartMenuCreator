import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { ShareService } from '../services/share.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MenuPage implements OnInit {
  menuItems: any[] = [];
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private shareService: ShareService
  ) {}

  ngOnInit() {
    this.loadMenu();
  }

  loadMenu(event?: any) {
    this.loading = true;
    this.api.getAllMenuItems().subscribe({
      next: (res) => {
        if (res.success) {
          this.menuItems = res.data;
        }
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Menu Error:', err);
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  addToCart(item: any) {
    this.api.addToCart(item._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.cartService.updateCartCount(res.data.items.length);
          alert('Added to cart!');
        }
      },
      error: (err) => {
        console.error('Cart Error:', err);
        alert('Failed to add to cart.');
      }
    });
  }

  shareItem(item: any) {
    this.shareService.shareViaWhatsApp(item);
  }
}