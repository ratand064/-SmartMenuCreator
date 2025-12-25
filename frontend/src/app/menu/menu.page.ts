import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../components/skeleton-loader/skeleton-loader.component';
import { ToastService } from '../services/toast';

import { 
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon, IonImg, IonGrid, IonRow, 
  IonCol, IonRefresher, IonRefresherContent, IonSearchbar, 
  IonButtons, AlertController 
} from '@ionic/angular/standalone';

import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { ShareService } from '../services/share.service';

import { addIcons } from 'ionicons';
import { 
  logoWhatsapp, search, trash, create, 
  personCircle, personCircleOutline, add, sparkles, checkmarkCircle
} from 'ionicons/icons';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonIcon, IonImg, IonGrid, IonRow, 
    IonCol, IonRefresher, IonRefresherContent, IonSearchbar, 
    IonButtons
  ]
})
export class MenuPage implements OnInit {
  menuItems: any[] = [];
  filteredItems: any[] = [];
  loading: boolean = false;
  
  isAdminMode: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private api: ApiService,
    public cartService: CartService, 
    private shareService: ShareService,
    private alertCtrl: AlertController,
    private router: Router,
    private toast: ToastService,
  ) {
    addIcons({ 
      'logo-whatsapp': logoWhatsapp, search, 
      trash, create, 'person-circle': personCircle, 
      'person-circle-outline': personCircleOutline, add, sparkles,
      'checkmark-circle': checkmarkCircle
    });
  }

  ngOnInit() {
    this.loadMenu();
  }

  ionViewWillEnter() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      const savedMode = localStorage.getItem('viewMode');
      this.isAdminMode = savedMode === 'admin';
    } else {
      this.isAdminMode = false;
      this.isLoggedIn = false;
    }
  }

  async handleProfileClick() {
    this.checkLoginStatus();

    if (this.isLoggedIn) {
      const alert = await this.alertCtrl.create({
        header: 'Merchant Options',
        mode: 'ios',
        buttons: [
          {
            text: this.isAdminMode ? 'Switch to User View' : 'Switch to Admin View',
            handler: () => {
              this.isAdminMode = !this.isAdminMode;
              localStorage.setItem('viewMode', this.isAdminMode ? 'admin' : 'user');
              this.toast.success(`Switched to ${this.isAdminMode ? 'Admin' : 'User'} view`);
            }
          },
          {
            text: 'Logout',
            role: 'destructive',
            handler: () => {
              localStorage.removeItem('token');
              localStorage.removeItem('viewMode');
              this.isLoggedIn = false;
              this.isAdminMode = false;
              this.toast.success('Logged out successfully'); 
            }
          },
          { text: 'Cancel', role: 'cancel' }
        ]
      });
      await alert.present();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadMenu(event?: any) {
    if (!event) this.loading = true;
    this.api.getAllMenuItems().subscribe({
      next: (res) => {
        if (res.success) {
          this.menuItems = res.data;
          this.filteredItems = res.data;
        }
        this.loading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loading = false;
        if (event) event.target.complete();
        this.toast.error('Could not load menu');
      }
    });
  }

  filterItems(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredItems = query ? this.menuItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      (item.description && item.description.toLowerCase().includes(query))
    ) : this.menuItems;
  }

  addToCart(item: any) {
    this.api.addToCart(item._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.cartService.updateCartCount(res.data.items.length);
          this.cartService.triggerAnimateCart();
          this.toast.success(`${item.title} added to cart! 🍔`); 
        }
      },
      error: () => this.toast.error('Login to add items to cart')
    });
  }

  shareItem(item: any) {
    const appLink = window.location.origin + '/tabs/menu'; 
    const message = `🔥 *Check out this dish!* \n\n*${item.title}*\n💰 Price: *₹${item.price}*\n\n👉 Order here: ${appLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
  async editItem(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Item',
      inputs: [
        { name: 'title', value: item.title, placeholder: 'Title' },
        { name: 'price', value: item.price, type: 'number', placeholder: 'Price' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (data) => {
            this.api.updateMenuItem(item._id, data).subscribe({
              next: (res) => {
                if(res.success) {
                  this.loadMenu();
                  this.toast.success('Item updated! ✨'); 
                }
              },
              error: () => this.toast.error('Update failed')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteItem(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Item?',
      message: `Remove "${item.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteMenuItem(item._id).subscribe({
              next: (res) => {
                if (res.success) {
                  this.loadMenu();
                  this.toast.success('Item deleted');
                }
              },
              error: () => this.toast.error('Delete failed')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async showRewardInfo() {
    this.toast.success('🌟 You have 250 YumCoins!'); 
  }
}