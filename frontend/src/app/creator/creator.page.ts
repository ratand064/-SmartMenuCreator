import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.page.html',
  styleUrls: ['./creator.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreatorPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  inputText: string = '';
  parsedItem: any = null;
  loading: boolean = false;
  imageLoading: boolean = false;

  constructor(private api: ApiService) {}

  processAI() {
    if (!this.inputText.trim()) return;
    
    this.loading = true;
    this.api.extractMenuDetails(this.inputText).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.parsedItem = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('AI Error:', err);
        alert('Failed to process. Check backend.');
        this.loading = false;
      }
    });
  }

  generateImage() {
    if (!this.parsedItem?.title) return;
    
    this.imageLoading = true;
    this.api.generateAIImage(this.parsedItem.title).subscribe({
      next: (res) => {
        if (res.success) {
          this.parsedItem.imageUrl = res.imageUrl;
        }
        this.imageLoading = false;
      },
      error: (err) => {
        console.error('Image Error:', err);
        alert('Failed to generate image.');
        this.imageLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.parsedItem.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveItem() {
    if (!this.parsedItem) return;
    
    this.api.createMenuItem(this.parsedItem).subscribe({
      next: (res) => {
        console.log('Saved!', res);
        alert('Item saved successfully!');
        // Reset
        this.inputText = '';
        this.parsedItem = null;
      },
      error: (err) => {
        console.error('Save Error:', err);
        alert('Failed to save item.');
      }
    });
  }
}