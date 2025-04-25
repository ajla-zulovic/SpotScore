import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-new-city',
  templateUrl: './new-city.component.html',
  styleUrl: './new-city.component.css'
})
export class NewCityComponent {
  cityForm: FormGroup;
  states: any[] = [];
  isLoading = false;
  showPopup = false;
  message = '';
  isSuccess = true;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.cityForm = this.fb.group({
      cityName: ['', Validators.required],
      stateId: [null, Validators.required] 
    });
  }

  ngOnInit() {
    this.apiService.getStates().subscribe({
      next: (data) => {
        this.states = data.filter(state => state.stateId !== 0);
        console.log("Dohvaćene države:", this.states);

        if (this.states.length > 0) {
          this.cityForm.controls['stateId'].setValue(this.states[0].stateID);
          console.log("Postavljen defaultni stateId:", this.cityForm.value.stateId);
        }
      },
      error: (err) => {
        console.error("Error fetching states", err);
        this.message = "Failed to load states.";
        this.isSuccess = false;
        this.showPopup = true;
      }
    });
  }

  submitCity() {
    const cityName = this.cityForm.value.cityName.trim();
    const stateId = this.cityForm.value.stateId;

    if (!cityName || !stateId || stateId === 0) {
      this.message = "Please select a valid state.";
      this.isSuccess = false;
      this.showPopup = true;
      return;
    }


    const cityExists = this.states.some(state => 
      state.stateId === stateId && state.cities?.some(city => city.cityName.toLowerCase() === cityName.toLowerCase())
    );

    if (cityExists) {
      this.message = "This city already exists in the selected state.";
      this.isSuccess = false;
      this.showPopup = true;
      return;
    }

    console.log("Podaci koji se šalju API-ju:", { cityName, stateId });

    this.apiService.addCity({ cityName, stateId }).subscribe({
      next: (res) => {
        this.message = "Item added successfully";
        this.isSuccess = true;
        this.showPopup = true;
        this.cityForm.reset();
        this.isLoading = false;
      },
      error: (err) => {
        this.message = "Item already exists";
        this.isSuccess = false;
        this.showPopup = true;
        this.isLoading = false;
      }
    });
  }

  onStateChange(event: any) {
    this.cityForm.controls['stateId'].setValue(event.target.value);
    console.log("Odabrana država:", this.cityForm.value.stateId);
  }

  closePopup() {
    this.showPopup = false;
  }
}
