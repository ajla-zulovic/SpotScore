import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
 
  offers=[{
    id:1,
    name:'Noma, Denmark',
    img:'assets/noma.jpg',
    rating:'stars',
    category:'Restaurants'
  },
  { 
     id:2,
    name:'Osteria Francescana, Italia',
    img:'assets/osteria.jpg',
    rating:'stars',
    category:'Restaurants'
  },
    {  
      id:3,
      name:'Mirazur, French',
      img:'assets/mirazur.jpg',
      rating:'stars',
      category:'Restaurants'
    },
    {  
      id:4,
      name:'Four Seasons Firenze',
      img:'assets/hotel1.jpg',
      rating:'stars',
      category:'Hotels'
    },
    {  
      id:5,
      name:'Soneva Fushi',
      img:'assets/hotel2.jpg',
      rating:'stars',
      category:'Hotels'
    },
    {  
      id:6,
      name:'Raffles Singapore',
      img:'assets/hotel3.jpg',
      rating:'stars',
      category:'Hotels'
    },
    {  
      id:7,
      name:'Don Quijote',
      img:'assets/don.jpg',
      rating:'stars',
      category:'Books'
    },
    {  
      id:8,
      name:'The Lord of the Rings',
      img:'assets/rings.jpg',
      rating:'stars',
      category:'Books'
    },
    {  
      id:9,
      name:'The Great Gatsby',
      img:'assets/gatsby.jpg',
      rating:'stars',
      category:'Books'
    },
    {  
      id:10,
      name:'Avatar',
      img:'assets/avatar.jpg',
      rating:'stars',
      category:'Movies'
    },
    {  
      id:11,
      name:'Titanic',
      img:'assets/titanic.jpg',
      rating:'stars',
      category:'Movies'
    },
    {  
      id:12,
      name:'Captain America: Civil War',
      img:'assets/america.jpg',
      rating:'stars',
      category:'Movies'
    }

]

selectedOption:string="All";
selectedCategory: string = 'Restaurants';
constructor(private router: Router) {}
selectCategory(category: string): void {
  this.selectedCategory = category;
}
showDetails(offerId: number) {
  this.router.navigate(['/Details', offerId], {
    state: { offerDetails: this.offers.find(o => o.id === offerId) }
  });

}
}



