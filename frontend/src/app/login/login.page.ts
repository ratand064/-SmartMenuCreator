import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { keyOutline } from 'ionicons/icons';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, 
  IonItem, IonLabel, IonInput, IonButton, 
  IonSpinner, IonButtons, IonBackButton,
  IonIcon
} from '@ionic/angular/standalone';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, 
    IonItem, IonLabel, IonInput, IonButton, 
    IonSpinner, IonButtons, IonBackButton,
    IonIcon 
  ]
})
export class LoginPage {
  email: string = 'merchant@yumblock.com';
  password: string = 'merchant123';
  isLoading: boolean = false;

  constructor(private api: ApiService, private router: Router) {
    addIcons({ keyOutline });
  }

  onLogin() {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.api.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem('token', res.token);
          this.isLoading = false;
          this.router.navigate(['/tabs/menu']);
        }
      },
      error: () => {
        this.isLoading = false;
        alert('Login Failed!');
      }
    });
  }
}