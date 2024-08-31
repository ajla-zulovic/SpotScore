import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-offers-details',
  templateUrl: './offers-details.component.html',
  styleUrls: ['./offers-details.component.css']
})
export class OffersDetailsComponent {
  offerId: number;
  offerDetails: any;

  totalRating:number; // ova varijabla se sluziti da bi pohranila sumu ocjena i podijelila s br korisnika da bismo dobili PROSJEK
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Dohvati ID ponude iz rute
    this.offerId = +this.route.snapshot.paramMap.get('id');
    this.offerDetails = this.route.snapshot?.data?.['offerDetails'];
  }
  showPopup: boolean = false;
  userRating: number = 4.5;

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }


  submitRating() {
    console.log("User rating:", this.userRating);
    this.closePopup();
    
  
  }

}
