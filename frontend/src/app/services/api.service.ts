import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// INTERFACES
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

// SERVICE
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private primaryUrl = environment.apiUrl;
  private fallbackUrl = environment.fallbackApiUrl;
  private currentApiUrl = this.primaryUrl;

  constructor(private http: HttpClient) {}

  // HELPER: Get Headers with Token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // HELPER: Try with fallback
  private makeRequest<T>(
    requestFn: (url: string) => Observable<T>
  ): Observable<T> {
    return requestFn(this.currentApiUrl).pipe(
      catchError((error) => {
        // primary fail ho, fallback try 
        if (this.currentApiUrl === this.primaryUrl) {
          console.log('Primary API failed, trying fallback...');
          this.currentApiUrl = this.fallbackUrl;
          return requestFn(this.fallbackUrl).pipe(
            catchError((fallbackError) => {
              console.error('Both APIs failed');
              // Reset to primary for next request
              this.currentApiUrl = this.primaryUrl;
              return throwError(() => fallbackError);
            })
          );
        }
        // Reset to primary for next request
        this.currentApiUrl = this.primaryUrl;
        return throwError(() => error);
      })
    );
  }

  // AUTH
  login(email: string, password: string) {
    return this.makeRequest((url) =>
      this.http.post<any>(`${url}/auth/login`, { email, password })
    );
  }

  // MENU
  getAllMenuItems(): Observable<{ success: boolean; data: MenuItem[] }> {
    return this.makeRequest((url) =>
      this.http.get<{ success: boolean; data: MenuItem[] }>(`${url}/menu`)
    );
  }

  getMenuItem(id: string): Observable<{ success: boolean; data: MenuItem }> {
    return this.makeRequest((url) =>
      this.http.get<{ success: boolean; data: MenuItem }>(`${url}/menu/${id}`)
    );
  }

  // CREATE with Token
  createMenuItem(item: MenuItem): Observable<{ success: boolean; data: MenuItem }> {
    return this.makeRequest((url) =>
      this.http.post<{ success: boolean; data: MenuItem }>(
        `${url}/menu`,
        item,
        { headers: this.getHeaders() }
      )
    );
  }

  // UPDATE with Token
  updateMenuItem(id: string, item: Partial<MenuItem>): Observable<{ success: boolean; data: MenuItem }> {
    return this.makeRequest((url) =>
      this.http.put<{ success: boolean; data: MenuItem }>(
        `${url}/menu/${id}`,
        item,
        { headers: this.getHeaders() }
      )
    );
  }

  // DELETE with Token
  deleteMenuItem(id: string): Observable<{ success: boolean }> {
    return this.makeRequest((url) =>
      this.http.delete<{ success: boolean }>(
        `${url}/menu/${id}`,
        { headers: this.getHeaders() }
      )
    );
  }

  // CART
  getCart(): Observable<{ success: boolean; data: Cart }> {
    return this.makeRequest((url) =>
      this.http.get<{ success: boolean; data: Cart }>(`${url}/cart`)
    );
  }

  addToCart(menuItemId: string, quantity: number = 1): Observable<{ success: boolean; data: Cart }> {
    return this.makeRequest((url) =>
      this.http.post<{ success: boolean; data: Cart }>(
        `${url}/cart/add`,
        { menuItemId, quantity }
      )
    );
  }

  removeFromCart(menuItemId: string): Observable<{ success: boolean; data: Cart }> {
    return this.makeRequest((url) =>
      this.http.delete<{ success: boolean; data: Cart }>(
        `${url}/cart/remove/${menuItemId}`
      )
    );
  }

  clearCart(): Observable<{ success: boolean }> {
    return this.makeRequest((url) =>
      this.http.delete<{ success: boolean }>(`${url}/cart/clear`)
    );
  }

  // AI
  extractMenuDetails(userInput: string): Observable<AIResponse> {
    return this.makeRequest((url) =>
      this.http.post<AIResponse>(`${url}/ai/extract`, { userInput })
    );
  }

  generateAIImage(dishName: string): Observable<{ success: boolean; imageUrl: string }> {
    return this.makeRequest((url) =>
      this.http.post<{ success: boolean; imageUrl: string }>(
        `${url}/ai/generate-image`,
        { dishName }
      )
    );
  }
}