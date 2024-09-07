import { NgModule } from '@angular/core';
import { SolariumCarouselComponent } from './solarium-carousel.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    SolariumCarouselComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SolariumCarouselComponent,
  ]
})
export class SolariumCarouselModule { }
