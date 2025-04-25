import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-new-genre',
  templateUrl: './new-genre.component.html',
  styleUrl: './new-genre.component.css'
})
export class NewGenreComponent {
  genreForm: FormGroup;
  isLoading = false;
  showPopup = false;
  message = '';
  isSuccess = true;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.genreForm = this.fb.group({
      genreName: ['', Validators.required]
    });
  }

  submitGenre() {
    if (this.genreForm.valid) {
      this.isLoading = true;
      console.log("Podaci koji se šalju API-ju:", this.genreForm.value);

      this.apiService.addGenre(this.genreForm.value).subscribe({
        next: (res) => {
          this.message = "Item added successfully";
          this.isSuccess = true;
          this.showPopup = true;
          this.genreForm.reset();
          this.isLoading = false;
        },
        error: (err) => {
          this.message = "Item already exists";
          this.isSuccess = false;
          this.showPopup = true;
          this.isLoading = false;
        }
      });
    } else {
      this.message = "Please enter a genre name.";
      this.isSuccess = false;
      this.showPopup = true;
    }
  }

  closePopup() {
    this.showPopup = false;
  }
}
