import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';  // ADD THIS
import { addIcons } from 'ionicons';  // ADD THIS
import { addCircle, restaurant, cart } from 'ionicons/icons';  // ADD THIS
import { camera } from 'ionicons/icons';
import { shareSocial } from 'ionicons/icons';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { trash, checkmarkCircle, closeCircle, cartOutline } from 'ionicons/icons';

// ADD THIS
addIcons({
  'add-circle': addCircle,
  'restaurant': restaurant,
  'cart': cart,
  'camera': camera,
  'share-social': shareSocial,
  'trash': trash,
  'checkmark-circle': checkmarkCircle,
  'close-circle': closeCircle,
  'cart-outline': cartOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(),  // ADD THIS
  ],
});