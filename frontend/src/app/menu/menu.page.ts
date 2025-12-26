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
  personCircle, personCircleOutline, add, sparkles, 
  checkmarkCircle, fastFood, pizza, cafe, iceCream, 
  restaurant, funnelOutline, leaf, close, walletOutline
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

  // Filter properties
  selectedCategory: string = 'all';
  selectedPriceRange: string = 'all';
  showFilterModal: boolean = false;
  categories = [
    { value: 'all', label: 'All', icon: 'restaurant' },
    { value: 'veg', label: 'Veg', icon: 'leaf' },
    { value: 'non-veg', label: 'Non-Veg', icon: 'fast-food' },
    { value: 'dessert', label: 'Dessert', icon: 'ice-cream' },
    { value: 'beverage', label: 'Drinks', icon: 'cafe' }
  ];

  priceRanges = [
    { value: 'all', label: 'All Prices', icon: 'wallet-outline', min: 0, max: Infinity },
    { value: 'under100', label: 'Under ₹100', icon: 'wallet-outline', min: 0, max: 100 },
    { value: '100-200', label: '₹100 - ₹200', icon: 'wallet-outline', min: 100, max: 200 },
    { value: '200-500', label: '₹200 - ₹500', icon: 'wallet-outline', min: 200, max: 500 },
    { value: 'above500', label: 'Above ₹500', icon: 'wallet-outline', min: 500, max: Infinity }
  ];

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
      'checkmark-circle': checkmarkCircle, 'fast-food': fastFood,
      pizza, cafe, 'ice-cream': iceCream, restaurant,
      'funnel-outline': funnelOutline, leaf, close,
      'wallet-outline': walletOutline
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
          this.applyFilters();
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

  // Filter by category
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // Filter by price range
  selectPriceRange(range: string) {
    this.selectedPriceRange = range;
    this.applyFilters();
  }

  toggleFilterModal() {
    this.showFilterModal = !this.showFilterModal;
  }

  // Apply all filters
  applyFilters(searchQuery?: string) {
    let filtered = [...this.menuItems];

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    if (this.selectedPriceRange !== 'all') {
      const priceRange = this.priceRanges.find(r => r.value === this.selectedPriceRange);
      if (priceRange) {
        filtered = filtered.filter(item => 
          item.price >= priceRange.min && item.price < priceRange.max
        );
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    this.filteredItems = filtered;
  }

  filterItems(event: any) {
    const query = event.target.value;
    if (!query || query.trim() === '') {
      this.applyFilters();
    } else {
      this.applyFilters(query);
    }
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

async shareItem(item: any) {
  const appLink = `${window.location.origin}/item/${item._id}`;
  const message = `🔥 *${item.title}*\n💰 ₹${item.price}\n\n👉 Order here: ${appLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
  fallbackWhatsAppShare(item: any, appLink: string, imageUrl: string) {
    const message = imageUrl 
      ? `🔥 *Check out this dish!* \n\n*${item.title}*\n💰 Price: *₹${item.price}*\n\n📸 ${imageUrl}\n\n👉 Order here: ${appLink}`
      : `🔥 *Check out this dish!* \n\n*${item.title}*\n💰 Price: *₹${item.price}*\n\n👉 Order here: ${appLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  async editItem(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Item',
      inputs: [
        { name: 'title', value: item.title, placeholder: 'Title' },
        { name: 'price', value: item.price, type: 'number', placeholder: 'Price' },
        { 
          name: 'category', 
          value: item.category, 
          type: 'text',
          placeholder: 'Category (veg/non-veg/dessert/beverage)' 
        }
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