import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, restaurant, cart } from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { ApiService } from '../services/api.service'; // Import ApiService

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge]
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  isAnimating: boolean = false;

  constructor(
    public cartService: CartService,
    private api: ApiService // ApiService inject karein
  ) {
    addIcons({ addCircle, restaurant, cart });
  }

  ngOnInit() {
    // 1. App start hote hi Cart ka latest data fetch karein
    this.refreshCart();

    // 2. Animation listener
    this.cartService.cartAnimation$.subscribe(() => {
      this.triggerBumpEffect();
    });
  }

  // Jab bhi user Tabs page par wapas aaye, cart check karein
  ionViewWillEnter() {
    this.refreshCart();
  }

  refreshCart() {
    this.api.getCart().subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.items) {
          // Service me count update karein taaki badge show ho
          this.cartService.updateCartCount(res.data.items.length);
        }
      }
    });
  }

  triggerBumpEffect() {
    this.isAnimating = true;
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }
}