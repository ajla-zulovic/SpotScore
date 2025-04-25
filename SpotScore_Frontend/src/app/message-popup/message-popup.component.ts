import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-message-popup',
  templateUrl: './message-popup.component.html',
  styleUrl: './message-popup.component.css'
})
export class MessagePopupComponent {
  @Input() message: string = '';  
  @Input() isSuccess: boolean = true;  
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();

  close() {
    this.closePopup.emit();
  }
}
