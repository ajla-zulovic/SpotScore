import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { PaginatedRequests } from '../interfaces/requestInterface';
import { NgToastService } from 'ng-angular-popup';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl:string = 'https://localhost:7247/api/'
  constructor(private http:HttpClient, private router:Router,private authService: AuthService,private toast: NgToastService) {}

    getUsers(){
      return this.http.get<any>(this.baseUrl+'Korisnik/GetAllUsers');

  }
  
  GetServicesByCategory(categoryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}ServiceContoller/by-category/${categoryId}`);
    
  }

  searchServicesByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}ServiceContoller/search?name=${name}`);
  }
  getServiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}ServiceContoller/${id}`);
  }
  
  rateService(serviceId: number, ratingValue: number): Observable<any> {
    const token = this.authService.getToken();
    const jwtHelper = new JwtHelperService();
    
    if (token && !jwtHelper.isTokenExpired(token)) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      const payload = { serviceId, ratingValue };
      return this.http.post(`${this.baseUrl}ServiceContoller/rate`, payload, { headers });
    } else {
      this.toast.info({
        detail: 'Info',
        summary: 'Please log in or create an account to rate services!',
        duration: 3000
      });
      this.authService.signOut(); 
      this.router.navigate(['/Login']);
      return new Observable(observer => observer.complete());
    }
  }
  getAuthToken() {
    const token = localStorage.getItem('token');
    console.log('JWT Token:', token); 
    if (!token) {
      this.router.navigate(['/Login']);
      return null;
    }
    return token;
  }
  
  // dohvati najbolje usluge iz određene kategorijee
  getBestServicesByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}ServiceContoller/best/${categoryId}`);
  }

    // dohvati usluge koje su najvise puta bile ocjenjene od strane korisnika
  getPopularServicesByCategory(categoryId: number): Observable<any[]> {
    console.log('Pozivam backend za Popular filter sa ID kategorije:', categoryId);
    return this.http.get<any[]>(`${this.baseUrl}ServiceContoller/popular/${categoryId}`);
  }
  
  // dio koji je vezan za slanje korisnickog zahtjeva za prijedlog usluge adminu 
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}Request/request/categories`);
  }

  createRequest(requestData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}Request/create/request`, requestData);
  }
  
  //dohvati sve zahtjeve 
  getAllRequests(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedRequests> {
    return this.http.get<PaginatedRequests>(`${this.baseUrl}Request/all/request?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }
  
  // dohvati filtrirane zahtjeve -> procitane odnosno neprocitane
  getFilteredRequests(filter: string, pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedRequests> {
    let url = `${this.baseUrl}Request/filter?filter=${filter}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<PaginatedRequests>(url);
  }
  

  updateRequestStatus(requestId: number): Observable<any> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
    });

    const body = JSON.stringify("Reviewed");  

    return this.http.put(`${this.baseUrl}Request/update-status/${requestId}`, body, { headers });
}

//api za dodavanje nove drzave, ukoliko ne postoji u bazi 
addState(stateName: string): Observable<any> {
  return this.http.post(`${this.baseUrl}ServiceContoller/add-state`, { stateName });
}

  //api za dodavanje novog grada, ukoliko ne postoji u bazi 
addCity(cityData: any): Observable<any> {
  return this.http.post(`${this.baseUrl}ServiceContoller/add-city`, cityData);
}
getStates(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}ServiceContoller/get-states`).pipe(
    tap((data) => console.log("Stanja dohvaćena iz API-ja:", data)) 
  );
}

// Dohvati sve žanrove
getGenres(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}ServiceContoller/get-genres`);
}
getCities(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}ServiceContoller/get-cities`);
}


addService(serviceData: FormData): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.authService.getToken()}`
  });
  return this.http.post(`${this.baseUrl}ServiceContoller/add-service`, serviceData, { headers });
}


// Dodaj novi žanr
addGenre(genreData: any): Observable<any> {
  return this.http.post(`${this.baseUrl}ServiceContoller/add-genre`, genreData);
}

getBlob(url: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${url}`, { responseType: 'blob' });
}

addComment(commentData:any){
  return this.http.post(`${this.baseUrl}ServiceContoller/add-comment`, commentData);
}

getCommentbyService(serviceId:any): Observable<any[]>{
  return this.http.get<any[]>(`${this.baseUrl}ServiceContoller/get-comments`, {params: {serviceId: serviceId.toString()}});
}


}
