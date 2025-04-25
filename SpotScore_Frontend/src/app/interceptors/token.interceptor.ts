import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(NgToastService);
  const router = inject(Router);

  const myToken = auth.getToken();

  if (myToken && auth.isLoggedIn() && !req.url.includes('/assets/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${myToken}` },
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      console.error('Error from interceptor:', err);

      const showToast = (type: 'error' | 'warning', title: string, message: string) => {
        if (type === 'error') {
          toast.error({ detail: title, summary: message });
        } else {
          toast.warning({ detail: title, summary: message });
        }
      };

      if (err instanceof HttpErrorResponse) {
        switch (err.status) {
          case 401: // Unauthorized
            showToast('warning', 'Warning', 'Session expired, please log in again!');
            if (auth.isLoggedIn()) {  
              auth.signOut();
              router.navigate(['Login']);
            }
            break;


          case 400: // Bad Request
            const errorMessage = err.error?.message || 'Bad Request!';
            showToast('error', 'Error', errorMessage);
            break;

          case 404: // Not Found
            showToast('error', 'Error', 'Resource not found!');
            break;

          case 0: // Network Error
            showToast('error', 'Error', 'Network error. Please check your connection.');
            break;

          default: // Other Errors
            showToast('error', 'Error', 'An unexpected error occurred.');
            break;
        }
      }

      return throwError(() => err);
    })
  );
};
