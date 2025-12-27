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
  searchQuery: string = ''; 
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
    private shareService: ShareService, // Keep if you use it, else remove
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

  //(Pull to Refresh) 
  handleRefresh(event: any) {
    this.loadMenu(event);
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
              this.applyFilters(); // Re-apply 
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

  loadMenu(refresherEvent?: any) {
   
    if (!refresherEvent) this.loading = true;

    this.api.getAllMenuItems().subscribe({
      next: (res) => {
        if (res.success) {
          this.menuItems = res.data;
          this.applyFilters(); // Apply current filters to new data
        }
        this.loading = false;
        if (refresherEvent) refresherEvent.target.complete();
      },
      error: () => {
        this.loading = false;
        if (refresherEvent) refresherEvent.target.complete();
        this.toast.error('Could not load menu. Swipe down to retry.');
      }
    });
  }
  
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  selectPriceRange(range: string) {
    this.selectedPriceRange = range;
    this.applyFilters();
  }

  toggleFilterModal() {
    this.showFilterModal = !this.showFilterModal;
  }

  // Updated to handle event from IonSearchbar correctly
  filterItems(event: any) {
    // Save the query so it persists if we change category later
    this.searchQuery = event.detail.value || ''; 
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.menuItems];

    // 1. Filter by Category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // 2. Filter by Price Range
    if (this.selectedPriceRange !== 'all') {
      const priceRange = this.priceRanges.find(r => r.value === this.selectedPriceRange);
      if (priceRange) {
        filtered = filtered.filter(item => 
          item.price >= priceRange.min && item.price < priceRange.max
        );
      }
    }

    // 3. Filter by Search Query (saved in variable)
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    this.filteredItems = filtered;
  }

 handleImageError(event: any) {
  if (event.target.src !== 'assets/placeholder.png') {
    event.target.src = 'assets/placeholder.png';
  }
}

  // CART LOGIC
  addToCart(item: any) {
    this.api.addToCart(item._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.cartService.updateCartCount(res.data.items.length);
          this.cartService.triggerAnimateCart();
          this.toast.success(`${item.title} added! 🍔`); 
        }
      },
      error: () => this.toast.error('Please login to order')
    });
  }

  // SHARE LOGIC 
  async shareItem(item: any) {
    // Current valid route
    const appLink = `${window.location.origin}/tabs/menu`;
    
    const message = `🔥 *${item.title}*\n` +
                    `😋 *Must Try!*\n` +
                    `💰 Price: ₹${item.price}\n\n` +
                    `👉 *Order Here:* ${appLink}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_system');
  }

  // Fallback function
  fallbackWhatsAppShare(item: any, appLink: string, imageUrl: string) {
    const message = `🔥 *${item.title}*\n💰 ₹${item.price}\n👉 Order: ${appLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_system');
  }

  // ADMIN FUNCTIONS 
  async editItem(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Item',
      mode: 'ios',
      inputs: [
        { name: 'title', value: item.title, placeholder: 'Dish Name' },
        { name: 'price', value: item.price, type: 'number', placeholder: 'Price' },
        { 
          name: 'category', 
          value: item.category, 
          type: 'text',
          placeholder: 'Category (veg/non-veg)' 
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (data) => {
            // Basic validation
            if(!data.title || !data.price) {
              this.toast.error('Name and Price are required');
              return false;
            }

            this.api.updateMenuItem(item._id, data).subscribe({
              next: (res) => {
                if(res.success) {
                  this.loadMenu();
                  this.toast.success('Item updated! ✨'); 
                }
              },
              error: () => this.toast.error('Update failed')
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteItem(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Dish?',
      message: `Are you sure you want to remove "${item.title}"?`,
      mode: 'ios',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes, Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteMenuItem(item._id).subscribe({
              next: (res) => {
                if (res.success) {
                  this.loadMenu();
                  this.toast.success('Item deleted successfully');
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
    this.toast.info('🌟 You have 250 YumCoins! Redeem them soon.'); 
  }
}