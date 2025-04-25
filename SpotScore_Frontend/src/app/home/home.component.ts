import { Component, AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  selectedCategory: string = 'Restaurants';
  selectedOption: string = 'All';
  services: any[] = [];
  errorMessage: string = '';
  searchTerm: string = ''; 
  searchPerformed: boolean = false; 
  isSearching: boolean = false; 
  searchQuery: string = ''; 

  selectedCategoryTranslated = '';
  selectedOptionTranslated = '';
  constructor(private servicesService: ApiService, private router: Router,private translate:TranslateService, private cdr: ChangeDetectorRef) {
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  ngAfterViewInit(): void {
    console.log('Komponenta je potpuno inicijalizovana');
    this.getServices();
    this.updateTranslations();
    this.cdr.detectChanges();
  }

  getServices(): void {
    console.log('Pokrenut getServices()');
    const categoryId = this.getCategoryId(this.selectedCategory);
  
    if (this.selectedOption === 'Best') {
      this.filterBestServices(categoryId); 
    } else if (this.selectedOption === 'Popular') {
      this.filterPopularServices(categoryId); 
    } else if (this.selectedOption === 'All') {
      this.servicesService.GetServicesByCategory(categoryId)
        .pipe(
          catchError((error) => {
            console.error('Greška tokom API poziva:', error);
            this.errorMessage = 'Došlo je do greške pri učitavanju usluga.';
            return of([]); 
          })
        )
        .subscribe((data) => {
          console.log('Rezultati za All filter:', data);
          this.services = data;
        });
    }
  }
  //za prevod "All of Restaurants"
  updateTranslations() {
    this.translate.get(`CATEGORY_${this.selectedCategory.toUpperCase()}`).subscribe(res => {
      this.selectedCategoryTranslated = res;
    });
    
    if (this.isSearching) {
      this.translate.get('SEARCH_RESULTS').subscribe(res => {
        this.selectedOptionTranslated = res;
      });
    } else {
      this.translate.get(this.selectedOption.toUpperCase()).subscribe(res => {
        this.selectedOptionTranslated = res;
      });
    }
  }
  

  changeCategory(category: string): void {
    this.selectedCategory = category;
    this.isSearching = false;
    this.updateTranslations();
    this.getServices();

  }

  getCategoryId(category: string): number {
    switch (category) {
      case 'Movies': return 1;
      case 'Restaurants': return 2;
      case 'Hotels': return 3;
      case 'Books': return 4;
      default: return 2;
    }
  }

  searchServices(): void {
    if (!this.searchTerm.trim()) {
      alert('Please enter a valid search term!');
      return;
    }
    this.isSearching = true;
  this.servicesService.searchServicesByName(this.searchTerm).subscribe({
    next: (results) => {
      this.services = results;
      this.searchPerformed = true;
      this.updateTranslations();
    },
    error: (err) => {
      console.error(err);
      this.services = [];
      this.searchPerformed = true;
      this.updateTranslations();
    }
  });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    if (query) {
      this.isSearching = true;
      this.selectedOption = ''; 
    } else {
      this.isSearching = false;
      this.resetFilters(); 
    }
  }

  resetFilters(): void {
    this.selectedOption = 'All'; 
    this.selectedCategory = 'Restaurants';
    this.getServices(); 
  }

  onEnter(): void {
    this.searchServices();
  }

  viewDetails(serviceId: number): void {
    this.router.navigate(['/service', serviceId]);
  }

  changeFilter(filter: string): void {
    this.selectedOption = filter;
    this.getServices();
    this.updateTranslations();
  }
  

  filterBestServices(categoryId: number): void {
    this.servicesService.getBestServicesByCategory(categoryId).subscribe({
      next: (data) => {
        console.log('Najbolje usluge:', data);
        this.services = data;
      },
      error: (err) => {
        console.error('Greška pri dobavljanju najboljih usluga:', err);
        this.errorMessage = 'Nije moguće učitati najbolje usluge.';
      }
    });
  }

  filterPopularServices(categoryId: number): void {
    this.servicesService.getPopularServicesByCategory(categoryId).subscribe({
      next: (data) => {
        console.log('Popularne usluge:', data);
        this.services = data;
      },
      error: (err) => {
        console.error('Greška pri dobavljanju popularnih usluga:', err);
        this.errorMessage = 'Nije moguće učitati popularne usluge.';
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
getStarsArray(rating: number): any[] {
  return new Array(5); 
}


}
