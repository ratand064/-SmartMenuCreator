import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, restaurant, cart } from 'ionicons/icons';
import { CartService } from '../services/cart.service';

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
  constructor(public cartService: CartService) {
    addIcons({ addCircle, restaurant, cart });
  }

  ngOnInit() {
    this.cartService.cartAnimation$.subscribe(() => {
      this.triggerBumpEffect();
    });
  }

  triggerBumpEffect() {
    this.isAnimating = true;
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }
}