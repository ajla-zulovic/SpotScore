import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-new-state',
  templateUrl: './new-state.component.html',
  styleUrl: './new-state.component.css'
})
export class NewStateComponent {
  stateForm: FormGroup;
  isLoading = false;
  showPopup = false;
  message = '';
  isSuccess = true;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.stateForm = this.fb.group({
      stateName: ['', Validators.required]
    });
  }

  submitState() {
    if (this.stateForm.valid && !this.isLoading) {
      this.isLoading = true;

      this.apiService.addState(this.stateForm.value.stateName).subscribe({
        next: (res) => {
          this.message = "Item added successfully";
          this.isSuccess = true;
          this.showPopup = true;
          this.stateForm.reset();
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
      this.message = "Please enter a state name.";
      this.isSuccess = false;
      this.showPopup = true;
    }
  }

  closePopup() {
    this.showPopup = false;
  }
}
