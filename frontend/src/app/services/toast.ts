import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) { }

  // 1. Success (Green)
  async success(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: 'success',
      position: 'top', 
      icon: 'checkmark-circle',
      mode: 'ios'
    });
    await toast.present();
  }

  // 2. Error (Red)
  async error(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: 'danger',
      position: 'top',
      icon: 'alert-circle',
      mode: 'ios'
    });
    await toast.present();
  }

  // 3. Info (Blue) - 
  async info(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 1500,
      color: 'primary', 
      position: 'top',
      icon: 'information-circle',
      mode: 'ios'
    });
    await toast.present();
  }
}