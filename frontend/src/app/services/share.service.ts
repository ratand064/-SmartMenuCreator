import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor() {}

  shareViaWhatsApp(item: any) {
    const message = 
      `🍽️ *${item.title}*%0A%0A` +
      `${item.description}%0A%0A` +
      `💰 Price: ₹${item.price}%0A%0A` +
      `Order now: ${environment.apiUrl.replace('/api', '')}/menu`;

    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
}