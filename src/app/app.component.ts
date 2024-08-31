import { Component, OnInit } from '@angular/core';


declare function porukaSuccess(a: string):any;
declare function porukaError(a: string):any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'spot-score';
  source:string='assets/Logo.png';

}
