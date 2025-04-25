import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var google: any;

@Component({
  selector: 'app-new-service',
  templateUrl: './new-service.component.html',
  styleUrls: ['./new-service.component.css']
})
export class NewServiceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('addressInput') addressInput!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  serviceForm!: FormGroup;
  categories = [
    { id: 1, name: 'Movies' },
    { id: 2, name: 'Restaurants' },
    { id: 3, name: 'Hotels' },
    { id: 4, name: 'Books' }
  ];
  genres: any[] = [];
  cities: any[] = [];
  selectedCategory: number = 0;
  selectedImage!: File;
  formSubmitted = false;
  
  map: any;
  marker: any;
  autocomplete: any;
  googleMapsLoaded = false;
  isGeocoding = false;
  private mapInitialized = false;
  private mapInitTimeout: any;
  private readonly MAX_INIT_ATTEMPTS = 5;
  private initAttempts = 0;

  showMessagePopup = false;
  popupMessage = '';
  popupSuccess = true;

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.loadInitialData();
    this.loadGoogleMaps();
  }

  initializeForm() {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      genreId: [''],
      cityId: [''],
      latitude: [''],
      longitude: [''],
      address: [''],
      imageFile: [null, Validators.required]
    });
  }

  loadInitialData() {
    this.api.getGenres().subscribe(data => (this.genres = data));
    this.api.getCities().subscribe({
      next: data => {
        this.cities = data;
        if (this.cities.length > 0 && !this.serviceForm.value.cityId) {
          this.serviceForm.patchValue({ cityId: this.cities[0].cityID });
        }
      },
      error: err => console.error('Failed to load cities:', err)
    });
  }

  async loadGoogleMaps() {
    if (typeof google !== 'undefined' && google.maps) {
      this.googleMapsLoaded = true;
      return;
    }

    try {
      await this.loadGoogleMapsScript();
      this.googleMapsLoaded = true;
      if (this.selectedCategory === 2 || this.selectedCategory === 3) {
        this.initMapWithRetry();
      }
    } catch (error) {
      console.error('Google Maps failed to load:', error);
      this.showPopup('Google Maps service is currently unavailable', false);
    }
  }

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBaMmnj_ZWUPNH4O_w9TycIZ-V1j9ySw8c&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => {
        console.error('Google Maps script failed to load:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  ngAfterViewInit() {
    if (this.selectedCategory === 2 || this.selectedCategory === 3) {
      this.initMapWithRetry();
    }
  }

  ngOnDestroy() {
    if (this.mapInitTimeout) {
      clearTimeout(this.mapInitTimeout);
    }
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
    }
  }

  private initMapWithRetry(attempt: number = 1) {
    if (attempt > this.MAX_INIT_ATTEMPTS) {
      console.error('Max initialization attempts reached');
      return;
    }

    if (this.mapContainer?.nativeElement && this.googleMapsLoaded) {
      this.initMap();
    } else {
      console.log(`Waiting for map container (attempt ${attempt})`);
      this.mapInitTimeout = setTimeout(() => this.initMapWithRetry(attempt + 1), 300 * attempt);
    }
  }

  initMap() {
    if (this.mapInitialized || !this.mapContainer?.nativeElement) return;

    const container = this.mapContainer.nativeElement;
    const defaultLocation = { lat: 43.3438, lng: 17.8078 };
    
    this.map = new google.maps.Map(container, {
      center: defaultLocation,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      gestureHandling: 'greedy'
    });

    this.marker = new google.maps.Marker({
      map: this.map,
      position: defaultLocation,
      draggable: true,
      title: "Drag me to adjust location"
    });

    this.marker.addListener('dragend', () => {
      const position = this.marker.getPosition();
      this.updateFormLocation(
        position.lat(),
        position.lng(),
        "Custom location"
      );
    });

    this.map.addListener('click', (event: any) => {
      this.marker.setPosition(event.latLng);
      this.updateFormLocation(
        event.latLng.lat(),
        event.latLng.lng(),
        "Custom location"
      );
    });

    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
      this.map.setCenter(defaultLocation);
    }, 300);

    this.mapInitialized = true;
  }

  initAutocomplete() {
    if (!this.addressInput?.nativeElement) return;

    this.autocomplete = new google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      { 
        types: ['establishment', 'geocode'],
        fields: ['formatted_address', 'geometry', 'address_components']
      }
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place.geometry) {
        this.showPopup('Location not found, please try again', false);
        return;
      }
      this.handlePlaceSelection(place);
    });
  }

  onCityChange(event: any) {
    const cityId = event.target.value;
    const selectedCity = this.cities.find(c => c.cityID == cityId);
    
    if (selectedCity) {
      if (selectedCity.latitude && selectedCity.longitude) {
        this.updateFormLocation(
          selectedCity.latitude,
          selectedCity.longitude,
          selectedCity.cityName
        );
      } else {
        this.geocodeCity(selectedCity.cityName);
      }
    }
  }

  geocodeCity(cityName: string) {
    if (!this.googleMapsLoaded) return;

    this.isGeocoding = true;
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: cityName }, (results: any, status: any) => {
      this.isGeocoding = false;
      if (status === 'OK' && results[0]?.geometry) {
        const location = results[0].geometry.location;
        this.updateFormLocation(
          location.lat(),
          location.lng(),
          results[0].formatted_address
        );
      } else {
        this.showPopup('Could not find location for selected city', false);
      }
    });
  }

  handlePlaceSelection(place: any) {
    const location = place.geometry.location;
    this.updateFormLocation(
      location.lat(),
      location.lng(),
      place.formatted_address
    );
    this.autoSelectCity(place);
  }

  updateFormLocation(lat: number, lng: number, address?: string) {
    this.serviceForm.patchValue({
      latitude: lat,
      longitude: lng,
      ...(address && { address: address })
    });
    this.updateMapView(lat, lng);
  }

  updateMapView(lat: number, lng: number) {
    if (!this.map || !this.marker) return;
    
    const newPosition = new google.maps.LatLng(lat, lng);
    this.map.setCenter(newPosition);
    this.marker.setPosition(newPosition);
    this.map.setZoom(14);
  }

  autoSelectCity(place: any) {
    if (!place.address_components || !this.cities.length) return;

    const cityComponent = place.address_components.find((c: any) => 
      c.types.includes('locality')
    );
    if (cityComponent) {
      const matchingCity = this.cities.find(c => 
        c.cityName.toLowerCase() === cityComponent.long_name.toLowerCase()
      );
      if (matchingCity) {
        this.serviceForm.patchValue({ cityId: matchingCity.cityID });
      }
    }
  }

  onCategoryChange(event: any) {
    this.selectedCategory = Number(event.target.value);
    this.resetLocationFields();
    
    if (this.selectedCategory === 2 || this.selectedCategory === 3) {
      if (this.googleMapsLoaded) {
        this.initMapWithRetry();
      }
    }
  }

  resetLocationFields() {
    this.serviceForm.patchValue({
      genreId: '',
      cityId: '',
      latitude: '',
      longitude: '',
      address: ''
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.serviceForm.patchValue({ imageFile: file });
    }
  }

  submitService() {
    this.formSubmitted = true;

    if (this.serviceForm.invalid || !this.selectedImage) {
      this.showPopup('Please fill out the form correctly and select an image.', false);
      return;
    }

    if ((this.selectedCategory === 1 || this.selectedCategory === 4) && !this.serviceForm.value.genreId) {
      this.showPopup('Genre is required for the selected category.', false);
      return;
    }

    if ((this.selectedCategory === 2 || this.selectedCategory === 3) &&
      (!this.serviceForm.value.cityId || !this.serviceForm.value.latitude ||
        !this.serviceForm.value.longitude || !this.serviceForm.value.address)) {
      this.showPopup('City, Address, Latitude, and Longitude are required for this category.', false);
      return;
    }

    this.sendFormData();
  }

  sendFormData() {
    const formData = this.createFormData();
    
    this.api.addService(formData).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  createFormData(): FormData {
    const formData = new FormData();
    formData.append('Name', this.serviceForm.value.name);
    formData.append('Description', this.serviceForm.value.description);
    formData.append('CategoryId', this.serviceForm.value.categoryId);
    formData.append('ImageFile', this.selectedImage);

    if (this.selectedCategory === 1 || this.selectedCategory === 4) {
      formData.append('GenreId', this.serviceForm.value.genreId);
    } else if (this.selectedCategory === 2 || this.selectedCategory === 3) {
      formData.append('CityId', this.serviceForm.value.cityId);
      formData.append('Latitude', this.serviceForm.value.latitude);
      formData.append('Longitude', this.serviceForm.value.longitude);
      formData.append('Address', this.serviceForm.value.address);
    }

    return formData;
  }

  handleSuccess() {
    this.showPopup('Service added successfully!', true);
    this.resetForm();
  }

  handleError(err: any) {
    console.error('Failed to add service:', err);
    this.showPopup('Error adding service. Please try again.', false);
  }

  resetForm() {
    this.serviceForm.reset();
    this.selectedCategory = 0;
    this.formSubmitted = false;
    this.selectedImage = undefined!;
    this.fileInput.nativeElement.value = '';
  }

  showPopup(message: string, success: boolean) {
    this.popupMessage = message;
    this.popupSuccess = success;
    this.showMessagePopup = true;
  }
}