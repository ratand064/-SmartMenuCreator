import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public cartCount$ = new BehaviorSubject<number>(0);

  //  NEW: Animation Trigger ke liye Subject
  private cartAnimationSubject = new Subject<void>();
  public cartAnimation$ = this.cartAnimationSubject.asObservable();

  constructor() {}

  updateCartCount(count: number) {
    this.cartCount$.next(count);
  }

  //  NEW: Call this whenever an item is added
  triggerAnimateCart() {
    this.cartAnimationSubject.next();
  }
}