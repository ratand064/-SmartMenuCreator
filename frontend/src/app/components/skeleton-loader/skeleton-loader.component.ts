import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonSkeletonText, IonGrid, IonRow, IonCol, 
  IonCard, IonList, IonItem, IonThumbnail, IonLabel 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonSkeletonText, IonGrid, IonRow, IonCol, 
    IonCard, IonList, IonItem, IonThumbnail, IonLabel
  ]
})
export class SkeletonLoaderComponent {
  
  @Input() view: 'menu' | 'cart' = 'menu';

  items = [1, 2, 3, 4, 5, 6]; 
}