import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGenreComponent } from './new-genre.component';

describe('NewGenreComponent', () => {
  let component: NewGenreComponent;
  let fixture: ComponentFixture<NewGenreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewGenreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewGenreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
