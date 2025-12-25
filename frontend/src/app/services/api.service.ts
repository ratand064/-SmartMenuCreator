import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/*INTERFACES*/
export interface MenuItem {
  _id?: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  merchantId?: string;
  createdAt?: Date;
}

export interface AIResponse {
  success: boolean;
  data?: {
    title: string;
    description: string;
    price: number;
    category?: string;
  };
  error?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  _id?: string;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  totalPrice: number;
}

/*  SERVICE  */

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /*  HELPER: Get Headers with Token  */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    //   console.log('Token added to request');
    } else {
    //   console.log('No token found');
    }

    return headers;
  }

  /*  AUTH  */
  login(email: string, password: string) {
    return this.http.post<any>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    );
  }



  /*  MENU  */
  getAllMenuItems(): Observable<{ success: boolean; data: MenuItem[] }> {
    return this.http.get<{ success: boolean; data: MenuItem[] }>(
      `${this.apiUrl}/menu`
    );
  }

  getMenuItem(id: string): Observable<{ success: boolean; data: MenuItem }> {
    return this.http.get<{ success: boolean; data: MenuItem }>(
      `${this.apiUrl}/menu/${id}`
    );
  }

  //  CREATE with Token
  createMenuItem(item: MenuItem): Observable<{ success: boolean; data: MenuItem }> {
    return this.http.post<{ success: boolean; data: MenuItem }>(
      `${this.apiUrl}/menu`,
      item,
      { headers: this.getHeaders() }  //  TOKEN ADDED
    );
  }

  //  UPDATE with Token
  updateMenuItem(id: string, item: Partial<MenuItem>): Observable<{ success: boolean; data: MenuItem }> {
    return this.http.put<{ success: boolean; data: MenuItem }>(
      `${this.apiUrl}/menu/${id}`,
      item,
      { headers: this.getHeaders() }  //  TOKEN ADDED
    );
  }

  //  DELETE with Token
  deleteMenuItem(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/menu/${id}`,
      { headers: this.getHeaders() }  //  TOKEN ADDED
    );
  }

  /*  CART  */
  getCart(): Observable<{ success: boolean; data: Cart }> {
    return this.http.get<{ success: boolean; data: Cart }>(
      `${this.apiUrl}/cart`
    );
  }

  addToCart(menuItemId: string, quantity: number = 1): Observable<{ success: boolean; data: Cart }> {
    return this.http.post<{ success: boolean; data: Cart }>(
      `${this.apiUrl}/cart/add`,
      { menuItemId, quantity }
    );
  }

  removeFromCart(menuItemId: string): Observable<{ success: boolean; data: Cart }> {
    return this.http.delete<{ success: boolean; data: Cart }>(
      `${this.apiUrl}/cart/remove/${menuItemId}`
    );
  }

  clearCart(): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/cart/clear`
    );
  }

/*  AI  */
extractMenuDetails(userInput: string): Observable<AIResponse> {
  return this.http.post<AIResponse>(
    `${this.apiUrl}/ai/extract`,
    { userInput }
  );
}

//  ADD THIS
generateAIImage(dishName: string): Observable<{ success: boolean; imageUrl: string }> {
  return this.http.post<{ success: boolean; imageUrl: string }>(
    `${this.apiUrl}/ai/generate-image`,
    { dishName }
  );
}
}