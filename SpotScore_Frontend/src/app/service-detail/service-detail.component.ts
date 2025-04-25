
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { NgToastService } from 'ng-angular-popup';
import * as L from 'leaflet'; 
@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css']
})
export class ServiceDetailComponent implements OnInit, AfterViewInit {
  service: any;
  selectedStars: number | null = null;
  hasRated: boolean = false;
  map: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toast: NgToastService
  ) {}

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      const serviceIdNumber = +serviceId;

      this.apiService.getServiceById(serviceIdNumber).subscribe({
        next: (data) => {
          this.service = data;
          this.hasRated = !!data.userRating;
          this.selectedStars = data.userRating;

          // Provjera da li API vraća latitude i longitude
          console.log("Service Data:", this.service);
          console.log("Latitude:", this.service.latitude, "Longitude:", this.service.longitude);

          if (this.isHotelOrRestaurant() && this.service.latitude && this.service.longitude) {
            setTimeout(() => {
              this.loadLeaflet();
            }, 500);
          }
        },
        error: (err) => {
          console.error('Error fetching service details:', err);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isHotelOrRestaurant() && this.service.latitude && this.service.longitude) {
      this.loadLeaflet();
    }
  }

  async loadLeaflet(): Promise<void> {
    if (typeof window !== 'undefined') {
      const L = await import('leaflet');
  
     
      const defaultIcon = L.icon({
        iconUrl: 'assets/marker-icon-2x-red.png',
        iconRetinaUrl: 'assets/marker-icon-2x-red.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
  
      if (this.service && this.service.latitude && this.service.longitude) {
        if (this.map) {
          this.map.remove();
        }
  
        
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
          console.error("Map container not found!");
          return;
        }
  
        this.map = L.map('map').setView([this.service.latitude, this.service.longitude], 15);
  
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);
  
       
        L.marker([this.service.latitude, this.service.longitude], { icon: defaultIcon })
          .addTo(this.map)
          .bindPopup(`<b>${this.service.name}</b><br>${this.service.description}`)
          .openPopup();
      } else {
        console.error("Latitude or Longitude is missing!");
      }
    }
  }
  
  

  isHotelOrRestaurant(): boolean {
    return this.service?.categoryId === 2 || this.service?.categoryId === 3;
  }

  


  submitRating(rating: number) {
    if (this.hasRated) {
      this.toast.warning({
        detail: 'Warning',
        summary: 'You have already rated this service!',
        duration: 3000
      });
      return;
    }
  
    this.apiService.rateService(this.service.serviceID, rating).subscribe({
      next: (response) => {
        console.log("Rating response:", response);
  
        this.service.userRating = rating;
        this.selectedStars = rating;
        this.hasRated = true;
  
        this.toast.success({
          detail: 'Success',
          summary: `Thank you for rating ${rating} stars!`,
          duration: 3000
        });
  
        this.apiService.getServiceById(this.service.serviceID).subscribe({
          next: (updatedService) => {
            console.log("Updated service:", updatedService);
            this.service = updatedService;
          },
          error: (err) => {
            console.error('Error refreshing service details:', err);
          }
        });
      },
      error: (err) => {
        if (err.status === 400 && err.error?.message === "You have already rated this service.") {
          this.toast.warning({
            detail: 'Warning',
            summary: 'You have already rated this service!',
            duration: 3000
          });
          this.hasRated = true;
          console.warn('User already rated this service.'); 
          return;
        }
        console.error("Unexpected rating error:", err);
        this.toast.error({
          detail: 'Error',
          summary: 'An unexpected error occurred. Please try again later.',
          duration: 3000
        });
      }
    });
  }
  
  //za slike  :
  getImageUrl(picturePath: string): string {
    if (!picturePath) {
      return 'https://localhost:7247/images/default.png'; 
    }
    
    return `https://localhost:7247${picturePath}`; 
  }
  
}
