import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.css'
})
export class RatingStarsComponent {
  @Input() disabled: boolean = false; 
  @Input() currentRating: number | null = null; 
  @Output() onRate = new EventEmitter<number>(); 

  stars: number[] = [1, 2, 3, 4, 5];
  selectedStars: number | null = null;

  rate(stars: number) {
    if (this.disabled) {
      return; 
    }
    this.selectedStars = stars; // Postavi lokalno stanje na broj zvijezda
    this.onRate.emit(stars); // Emituj događaj
  }
  
  getStarsClass(star: number): string {
    if (this.disabled && star <= (this.selectedStars || this.currentRating || 0)) {
      return 'selected'; 
    }
    if (!this.disabled && star <= this.selectedStars!) {
      return 'highlighted';
    }
    return ''; 
  }
  
}
