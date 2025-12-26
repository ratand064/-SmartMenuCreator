import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, restaurant, cart } from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { ApiService } from '../services/api.service'; 

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
    private api: ApiService 
  ) {
    addIcons({ addCircle, restaurant, cart });
  }

  ngOnInit() {

    this.refreshCart();

    this.cartService.cartAnimation$.subscribe(() => {
      this.triggerBumpEffect();
    });
  }
  ionViewWillEnter() {
    this.refreshCart();
  }

  refreshCart() {
    this.api.getCart().subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.items) {
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