import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Clone request and add token if available
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      // console.log(' Token added to request:', req.url);
    } else {
      // console.log(' No token found for request:', req.url);
    }

    // Handle request
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        
        console.error(' HTTP Error:', error);

        // Handle 401 Unauthorized
        if (error.status === 401) {
          console.log(' Session expired - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('currentViewMode');
          localStorage.removeItem('merchantId');
          this.router.navigate(['/merchant/login']);
        }

        // Handle 403 Forbidden
        if (error.status === 403) {
          console.log('Access denied - not a merchant');
          this.router.navigate(['/merchant/login']);
        }

        return throwError(() => error);
      })
    );
  }
}