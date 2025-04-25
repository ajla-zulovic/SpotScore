
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = "https://localhost:7247/api/Korisnik/";
  private userPayload: any = null;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn()); 
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  
  constructor(private http: HttpClient, private router: Router) {
    this.userPayload = this.decodedToken(); 
  }

  signUp(signupObj: any) {
    return this.http.post<any>(`${this.baseUrl}Register`, signupObj);
  }

  loginUser(loginObj: any) {
    return this.http.post<any>(`${this.baseUrl}Login`, loginObj).pipe(
      tap(response => {
        if (response && response.token) {
          console.log('Token received:', response.token);
          this.storeToken(response.token);
          this.userPayload = this.decodedToken();
        }
      })
    );
  }

  
  signOut() {
    console.log('Signing out... Clearing token.');
    localStorage.clear();
    this.userPayload = null;
    this.isLoggedInSubject.next(false);
    this.router.navigate(['Login']); 
  }
  
  

  storeToken(tokenValue: string) {
    console.log('Storing token:', tokenValue);
    localStorage.setItem('token', tokenValue);
    this.isLoggedInSubject.next(true);
  }
  
  getToken() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const jwtHelper = new JwtHelperService();
    return token ? !jwtHelper.isTokenExpired(token) : false;
  }

  decodedToken() {
    if (!this.userPayload) { // Dekodiraj token samo jednom
      const jwtHelper = new JwtHelperService();
      const token = this.getToken();
      if (token) {
        this.userPayload = jwtHelper.decodeToken(token);
      }
    }
    return this.userPayload;
  }

  getFullnameFromToken() {
    this.initializeUserPayload();
    return this.userPayload ? this.userPayload.unique_name : null;
  }

  getRoleFromToken() {
    this.initializeUserPayload();
    return this.userPayload ? this.userPayload.role : null;
  }

  private initializeUserPayload() {
    if (!this.userPayload) {
      this.userPayload = this.decodedToken();
    }
  }

  getUserProfile() {
    return this.http.get<any>(`${this.baseUrl}GetUserProfile`);
  }
  
  clearUserData() {
    this.userPayload = null;
  }

  getUserIdFromToken(): number | null {
    this.initializeUserPayload();
    return this.userPayload ? this.userPayload.UserId : null;
  }
  
  

}
