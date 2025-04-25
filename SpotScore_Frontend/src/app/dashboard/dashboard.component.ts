import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { StoreUserService } from '../services/store-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public users: any = [];
  public fullName: string = '';
  public role: string = '';

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private store: StoreUserService,
    private router: Router
  ) {}


  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['Login']); 
      return;
    }
  
    this.resetDashboardState(); // Resetiraj dashboard stanje
  
    this.api.getUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  
    this.store.getFullnameFromStore().subscribe((val) => {
      const fullNameFromToken = this.auth.getFullnameFromToken();
      this.fullName = val || fullNameFromToken || 'User';
    });
  
    this.store.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken || 'User';
    });
  }
  
  resetDashboardState(): void {
    this.users = [];
    this.fullName = '';
    this.role = '';
  }
  
}
