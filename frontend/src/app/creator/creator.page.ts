import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel,
  IonButton, IonIcon, IonTextarea, IonSpinner,
  IonGrid, IonRow, IonCol, AlertController, IonInput, IonButtons
} from '@ionic/angular/standalone';

import { ApiService } from '../services/api.service';
import { addIcons } from 'ionicons';
import { mic, micOutline, sparkles, camera, checkmarkCircle, keyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.page.html',
  styleUrls: ['./creator.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel,
    IonButton, IonIcon, IonTextarea, IonSpinner,
    IonGrid, IonRow, IonCol, IonInput,
  ]
})
export class CreatorPage implements OnInit, OnDestroy {
  inputText: string = '';
  parsedItem: any = null;
  loading: boolean = false;
  imageLoading: boolean = false;
  isListening: boolean = false;
  recognition: any;
  silenceTimer: any;

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private router: Router,
    private toast: ToastService,
    private ngZone: NgZone,
  ) {
    addIcons({
      mic, 'mic-outline': micOutline, sparkles, camera, 'checkmark-circle': checkmarkCircle, keyOutline
    });
  }

  ngOnInit() {
    this.initVoiceRecognition();
  }

  // 🎙️ VOICE RECOGNITION 
  initVoiceRecognition() {
    const { webkitSpeechRecognition, SpeechRecognition }: any = window;
    const SpeechAPI = webkitSpeechRecognition || SpeechRecognition;
    if (!SpeechAPI) return;

    this.recognition = new SpeechAPI();
    this.recognition.continuous = false;
    this.recognition.lang = 'en-IN';
    this.recognition.interimResults = true;

    this.recognition.onstart = () => this.ngZone.run(() => { this.isListening = true; this.startSilenceTimer(); });
    this.recognition.onresult = (event: any) => this.ngZone.run(() => {
      this.resetSilenceTimer();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        this.inputText = event.results[i].isFinal ? transcript.trim() : transcript;
      }
    });
    this.recognition.onerror = () => this.stopListening();
    this.recognition.onend = () => this.stopListening();
  }

  startSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => { if (this.recognition && this.isListening) this.recognition.stop(); }, 5000);
  }

  resetSilenceTimer() { this.clearSilenceTimer(); this.startSilenceTimer(); }
  clearSilenceTimer() { if (this.silenceTimer) clearTimeout(this.silenceTimer); }
  
  startListening() {
    if (!this.recognition) return;
    if (this.isListening) this.recognition.stop();
    else { this.inputText = ''; try { this.recognition.start(); } catch (e) { this.recognition.stop(); } }
  }

  stopListening() { this.ngZone.run(() => { this.isListening = false; this.clearSilenceTimer(); }); }

  // AI PROCESSING
  processAI() {
    if (!this.inputText.trim()) return;
    this.loading = true;
    this.parsedItem = null;

    this.api.extractMenuDetails(this.inputText).subscribe({
      next: (res) => {
        if (res.success) {
          this.parsedItem = res.data;
          this.toast.success('Details extracted! Now choose an image.');
        }
        this.loading = false;
      },
      error: () => { this.loading = false; this.toast.error('AI Processing Failed'); }
    });
  }

  // AI IMAGE GENERATION (Manual Trigger) 
  generateImage() {
    if (!this.parsedItem?.title) return;
    this.imageLoading = true;
    const dishName = this.parsedItem.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const seed = Math.floor(Math.random() * 1000000);
    const prompt = encodeURIComponent(`professional food photography of ${dishName}, indian restaurant dish, appetizing, 4k`);
    
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${seed}`;
    this.toast.success("AI is painting... 🎨");

    const img = new Image();
    img.onload = () => this.ngZone.run(() => { this.parsedItem.imageUrl = url; this.imageLoading = false; });
    img.onerror = () => this.ngZone.run(() => {
      this.parsedItem.imageUrl = `https://picsum.photos/seed/${dishName}${seed}/800/600`;
      this.imageLoading = false;
    });
    img.src = url;
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600';
  }

  // IMAGE COMPRESSION  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        this.ngZone.run(() => {
          if (!this.parsedItem) this.parsedItem = { title: '', description: '', price: 0 };
          this.parsedItem.imageUrl = compressedBase64;
          this.toast.success("Image uploaded & compressed! ✅");
        });
      };
    };
    reader.readAsDataURL(file);
  }

  // SAVE 
  async saveItem() {
    if (!this.parsedItem) return;
    if (this.imageLoading) { this.toast.error('Wait for image load'); return; }
    
    const token = localStorage.getItem('token');
    if (token) this.processSave();
    else await this.showLoginPopup();
  }

  async showLoginPopup() {
    const alert = await this.alertCtrl.create({
      header: 'Merchant Login 🔒',
      backdropDismiss: false,
      inputs: [
        { name: 'email', type: 'email', value: 'merchant@yumblock.com', placeholder: 'Email' },
        { name: 'password', type: 'password', value: 'merchant123', placeholder: 'Password' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Login & Save',
          handler: (data) => {
            this.api.login(data.email, data.password).subscribe({
              next: (res) => {
                if (res.success) { localStorage.setItem('token', res.token); this.processSave(); }
              },
              error: () => this.toast.error('Invalid Login')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  processSave() {
    this.loading = true;
    this.api.createMenuItem(this.parsedItem).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toast.success('Item saved! 🎉');
          this.inputText = '';
          this.parsedItem = null;
        }
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.status === 413 ? 'Image too large even after compression' : 'Save failed');
      }
    });
  }

  ngOnDestroy() { this.clearSilenceTimer(); if (this.recognition) this.recognition.stop(); }
}