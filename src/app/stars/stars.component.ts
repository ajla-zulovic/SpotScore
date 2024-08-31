import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.css']
})
export class StarsComponent {
  @Input() rating: number = 0;
  @Output() ratingChange: EventEmitter<number> = new EventEmitter<number>();
  stars: boolean[] = Array(5).fill(false);


  rate(rating: number): void {
    this.rating = rating;
    this.ratingChange.emit(this.rating);
  }

  // hover(index: number): void {
  //   this.stars = this.stars.map((_, i) => i < index);
  // }
  hoverTimeout: any;

 hover(index: number): void {
  clearTimeout(this.hoverTimeout);
  this.hoverTimeout = setTimeout(() => {
    this.stars = this.stars.map((_, i) => i < index);
  }, 100); // 100ms debounce
}


  leave(): void {
    this.stars=this.stars.map((_, i )=>i<this.rating);
  }
}
