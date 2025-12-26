import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, informationCircle } from 'ionicons/icons';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) {
    // Register icons
    addIcons({
      'checkmark-circle': checkmarkCircle,
      'close-circle': closeCircle,
      'information-circle': informationCircle
    });
  }

  async success(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle',
      cssClass: 'custom-toast',
      mode: 'ios' // iOS style works better on all platforms
    });
    await toast.present();
  }
  
  async error(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top',
      icon: 'close-circle',
      cssClass: 'custom-toast',
      mode: 'ios'
    });
    await toast.present();
  }

  async info(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'primary',
      position: 'top',
      icon: 'information-circle',
      cssClass: 'custom-toast',
      mode: 'ios'
    });
    await toast.present();
  }
}