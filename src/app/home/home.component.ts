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
      img:'assets/newHotel2.jpg',
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
    },
    {  
      id:13,
      name:'Lovely',
      img:'assets/rest1.jpg',
      rating:'stars',
      category:'Restaurants'
    },
    {  
      id:14,
      name:'Honeymoon',
      img:'assets/rest2.jpg',
      rating:'stars',
      category:'Restaurants'
    },
    {  
      id:15,
      name:'Ralahuv',
      img:'assets/rest3.jpg',
      rating:'stars',
      category:'Restaurants'
    },
    {  
      id:16,
      name:'Hiulak',
      img:'assets/hoot1.jpg',
      rating:'stars',
      category:'Hotels'
    },
    {  
      id:17,
      name:'Onolamtiko',
      img:'assets/hot2.jpeg',
      rating:'stars',
      category:'Hotels'
    },
    {  
      id:18,
      name:'Lacholiro',
      img:'assets/hotel3.jpg',
      rating:'stars',
      category:'Hotels'
    },
    {  
      id:19,
      name:'Avatar2',
      img:'assets/movie2.jpg',
      rating:'stars',
      category:'Movies'
    },
    {  
      id:20,
      name:'Drag me to Hell',
      img:'assets/movie3.jpg',
      rating:'stars',
      category:'Movies'
    },
    {  
      id:21,
      name:'The Nun',
      img:'assets/nun.jpg',
      rating:'stars',
      category:'Movies'
    },
    {  
      id:22,
      name:'Twilight',
      img:'assets/book1.jpg',
      rating:'stars',
      category:'Books'
    },
    {  
      id:23,
      name:'The Return of Great Powers',
      img:'assets/book2.jpeg',
      rating:'stars',
      category:'Books'
    },
    {  
      id:24,
      name:'The Top of The World',
      img:'assets/book3.jpg',
      rating:'stars',
      category:'Books'
    },
    

]

selectedOption:string="All";
selectedCategory: string = 'Restaurants';
constructor(private router: Router) {}

selectCategory(category: string, event: MouseEvent): void {
  event.preventDefault();  
  this.selectedCategory = category;
  console.log('Selected Category:', this.selectedCategory);
}

filterOffers() {
  return this.offers.filter(offer => offer.category === this.selectedCategory);
}


showDetails(offerId: number) {
  this.router.navigate(['/Details', offerId], {
    state: { offerDetails: this.offers.find(o => o.id === offerId)
     }
  });

}

}



