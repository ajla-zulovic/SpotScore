import { Component } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
displayNotification:boolean=true;
closeNotification(){
this.displayNotification=false;

}

}
