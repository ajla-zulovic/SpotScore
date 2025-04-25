import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { StoreUserService } from '../services/store-user.service';
import { ApiService } from '../services/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent {
public role:string="";
public imageUrl: string = '';
public categories: any[] = [];
public requestData = {
  userId: 2,
  serviceName: '',
  categoryId: '',
  description: '',
  imageUrl: ''
};
showPopup: boolean = false;
popupMessage: string = '';
isSuccess: boolean = true;



constructor(private auth:AuthService, private store:StoreUserService,private api:ApiService,private http:HttpClient) {
}

ngOnInit() {
  this.store.getRoleFromStore()
  .subscribe((val) => {
    const roleFromToken = this.auth.getRoleFromToken();
    this.role = val || roleFromToken;
  });

  this.api.getCategories().subscribe((data) => {
    this.categories = data;
  });


  const userIdFromToken = this.auth.getUserIdFromToken();
  if (userIdFromToken) {
    this.requestData.userId = userIdFromToken;
  }
}


submitRequest() {
  if (!this.requestData.serviceName || !this.requestData.categoryId || !this.requestData.description) {
    this.showPopupMessage('Please fill in all required fields.', false);
    return;
  }

  
  if (!this.requestData.imageUrl) {
    this.requestData.imageUrl = '';  
  }

  this.api.createRequest(this.requestData).subscribe(
    (response) => {
      this.showPopupMessage(response.Message || 'Request sent successfully!', true);
  
      this.requestData = { userId: this.requestData.userId, serviceName: '', categoryId: '', description: '', imageUrl: '' };
    },
    (error) => {
      this.showPopupMessage('Failed to send request. Please try again.', false);
      console.error(error);
    }
  );
}




resetForm() {
  this.requestData = {
    userId: 2,
    serviceName: '',
    categoryId: '',
    description: '',
    imageUrl: ''
  };
}

showPopupMessage(message: string, success: boolean): void {
  this.popupMessage = message;
  this.isSuccess = success;
  this.showPopup = true;
}


}
