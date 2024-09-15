import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolariumCarouselComponent } from './solarium-carousel.component';

describe('SolariumCarouselComponent', () => {
  let component: SolariumCarouselComponent;
  let fixture: ComponentFixture<SolariumCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolariumCarouselComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolariumCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
