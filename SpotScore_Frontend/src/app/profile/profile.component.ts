import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData: any = {}; 
  selectedFile: File | null = null; 
  previewImage: string | null = null;
  showModal: boolean = false;
  imageMessage: string = 'No image selected'; 
  showPopup: boolean = false;
popupMessage: string = '';
isSuccess: boolean = true;

  constructor(private auth: AuthService, private http: HttpClient) {}
  resetUserData(): void {
    this.userData = {
      id: null,
      firstName: null,
      lastName: null,
      email: null,
      username: null,
      profilePhoto: null,
    };
  }
  
  errorMessage: string = ''; 
  ngOnInit(): void {
    this.resetUserData();
    this.auth.getUserProfile().pipe(
      catchError((err) => {
        console.warn('Temporary error fetching user profile:', err); 
        this.errorMessage = 'Failed to load user profile. Please try again later.';
        return of(null); 
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.userData = data;
          if (this.userData.id) {
            this.loadProfilePhoto(this.userData.id);
          }
        }
      }
    });
  }

  
  loadProfilePhoto(userId: number): void {
    this.http.get(`https://localhost:7247/api/Korisnik/GetProfilePhoto?id=${userId}`, { responseType: 'blob' }).subscribe({
      next: (photoBlob) => {
        const photoUrl = URL.createObjectURL(photoBlob);
        this.userData.profilePhoto = photoUrl;
        console.log('Profile photo loaded:', photoUrl);
      },
      error: (err) => {
        console.error('Error fetching profile photo:', err);
        this.userData.profilePhoto = 'assets/default.png';
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];
  
    if (file && allowedTypes.includes(file.type)) {
      this.selectedFile = file;
      this.previewImage = URL.createObjectURL(file);
      this.imageMessage = file.name; 
    } else {
      this.showPopupMessage('Only JPEG and PNG files are allowed.', false);
      this.selectedFile = null;
      this.imageMessage = 'No image selected';
    }
  }
  

  uploadProfilePhoto(): void {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', this.selectedFile, this.selectedFile.name);

    this.http.post('https://localhost:7247/api/Korisnik/UploadProfilePhoto', formData).subscribe({
      next: (response: any) => {
        this.showPopupMessage(response.Message || 'Profile photo uploaded successfully!', true);
        this.loadProfilePhoto(this.userData.id); 
        this.selectedFile = null; 
      },
      error: (err) => {
        console.error('Error uploading profile photo:', err);
        this.showPopupMessage('Failed to upload profile photo. Please try again.', false);
      },
    });
  }


  openModal(): void {
    this.showModal = true;
  }

  
  closeModal(): void {
    this.showModal = false;
    this.previewImage = null;
  }
  removeImage(): void {
    this.selectedFile = null;
    this.previewImage = null;
    this.imageMessage = 'No image selected';
  }
  showPopupMessage(message: string, success: boolean): void {
    this.popupMessage = message;
    this.isSuccess = success;
    this.showPopup = true;
  }
  
}
