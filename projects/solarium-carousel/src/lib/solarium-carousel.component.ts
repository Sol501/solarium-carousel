import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { image } from './image-interface';

@Component({
  selector: 'lib-solarium-carousel',
  templateUrl: './solarium-carousel.component.html',
  styles: [],
})
export class SolariumCarouselComponent implements OnInit {
  @Input() images: image[] = [];
  @Input() cellsShown: number = 1;
  @Input() zoom: boolean | string = false;
  @Input() zoomPosition: string = 'top';
  @Input() showcase: boolean | string = false;
  @Input() showcasePosition: string = 'bottom';
  @Input() showcaseAccent: string = '#000000';
  @Input() dots: boolean | string = false;
  @Input() arrows: boolean | string = false;
  @Input() autoplay: boolean | string = false;
  @Input() autoplayInterval: number = 1000;
  @Input() imageFit: string = 'contain';
  @Input() rtl: boolean | string = false;
  @Input() loop: boolean | string = false;

  currentTransition: number = 0;
  currentContentIndex: number = 0;
  contentCount: number = 0;
  showcaseHorizontal: boolean = false;
  dragTranslate: number = 0;
  isDrag: boolean = false;
  private _autoplayDisabled: boolean = false;
  private _scrollOriginal: number = 0;
  private _dragStart: number = 0;

  private _isScrolling: boolean = false;
  private _touchStartX: number = 0;
  private _touchStartY: number = 0;

  // Add a threshold for the distance traveled in the x direction before the carousel's dragging event is triggered
  private readonly _DRAG_THRESHOLD: number = 100;

  constructor(private router: Router) {}

  ngOnInit(): void {
    document.addEventListener('touchstart', this.onTouchStart);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);

    this.validateInput();

    // TODO: content count can be either images length or children content count
    this.contentCount = this.images.length;

    this.currentContentIndex = this.loop ? 1 : 0;

    if (this.contentCount < 2) {
      this.arrows = false;
      this.dots = false;
      this.autoplay = false;
    }

    if (this.autoplay == true)
      setInterval(() => {
        if (!this._autoplayDisabled) this.next();
      }, this.autoplayInterval);
  }

  onTouchStart = (e: any) => {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
  };

  onTouchMove = (e: any) => {
    this._isScrolling = true;
    // Calculate the distance traveled in the x directions
    const x_distance = Math.abs(e.touches[0].clientX - this._touchStartX);
    const y_distance = Math.abs(e.touches[0].clientY - this._touchStartY);
    // If the distance traveled in the x direction is greater than the threshold distance,
    // it is a horizontal gesture and the carousel's dragging event should be triggered.
    // Otherwise, it is a vertical gesture and the carousel's dragging event should be prevented.
    if (x_distance > this._DRAG_THRESHOLD && x_distance > y_distance) {
      this._isScrolling = false;
    }
  };

  onTouchEnd = () => {
    this._isScrolling = false;
  };

  onDragStart(e: any, slider_width: number): void {
    if (this._isScrolling) return;
    this._autoplayDisabled = true;
    this.isDrag = true;
    this._dragStart = e.pageX || e.touches[0].pageX;
    this.dragTranslate = this.currentContentIndex * slider_width;
    this._scrollOriginal = this.dragTranslate;
  }

  onDragEnd(slider_width: number) {
    this._autoplayDisabled = false;
    this.isDrag = false;
    let closest_index = Math.round(this.dragTranslate / slider_width);
    let loop_index = closest_index;
    if (loop_index < 0) loop_index = 0;
    else if (loop_index > this.contentCount + 1) loop_index = this.contentCount;
    if (this.loop && closest_index > this.contentCount) closest_index = 1;
    else if (this.loop && closest_index < 1)
      closest_index = this.contentCount - this.cellsShown + 1;
    else if (!this.loop && closest_index >= this.contentCount)
      closest_index = this.contentCount - this.cellsShown;
    else if (!this.loop && closest_index < 0) closest_index = 0;
    if (this.loop && (loop_index > this.contentCount || loop_index < 1)) {
      this.changeCurrent(loop_index);
      setTimeout(() => {
        this.currentContentIndex = closest_index;
      }, this.currentTransition);
    } else this.changeCurrent(closest_index);
  }

  onContentDrag(e: any): void {
    if (!this.isDrag || this._isScrolling) return;
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX;
    const dist = x - this._dragStart;
    this.dragTranslate = this._scrollOriginal - dist;
  }

  onContentClick(action?: string) {
    if (!action) return;
    return this.router.navigateByUrl(action);
  }

  enableAutoplay() {
    this._autoplayDisabled = false;
  }

  disableAutoplay() {
    this._autoplayDisabled = true;
  }

  checkArrowVisible(condition: boolean) {
    if (
      !this.loop &&
      (this.currentContentIndex == 0 ||
        this.currentContentIndex == this.contentCount - 1)
    )
      this.enableAutoplay();
    return condition;
  }

  changeCurrent(new_index: number) {
    this._changeTransition();
    this.currentContentIndex = new_index;
  }

  next() {
    this._changeTransition();
    this.currentContentIndex = this.currentContentIndex + this.cellsShown;
    if (!this.loop && this.currentContentIndex >= this.contentCount) {
      this.currentContentIndex = this.contentCount - this.cellsShown;
    } else if (this.loop && this.currentContentIndex > this.contentCount) {
      setTimeout(() => {
        this.currentContentIndex = this.currentContentIndex - this.contentCount;
      }, this.currentTransition);
    }
  }

  previous() {
    this._changeTransition();
    this.currentContentIndex = this.currentContentIndex - this.cellsShown;
    if (!this.loop && this.currentContentIndex < 0) {
      this.currentContentIndex = 0;
    } else if (this.loop && this.currentContentIndex < 1) {
      setTimeout(() => {
        this.currentContentIndex = this.contentCount - this.cellsShown + 1;
      }, this.currentTransition);
    }
  }

  private validateInput() {
    this.zoom = this.zoom === 'true' || this.zoom === true;
    this.showcase = this.showcase === 'true' || this.showcase === true;
    this.dots = this.dots === 'true' || this.dots === true;
    this.arrows = this.arrows === 'true' || this.arrows === true;
    this.arrows = this.showcase ? false : this.arrows;
    this.autoplay = this.autoplay === 'true' || this.autoplay === true;
    this.rtl = this.rtl === 'true' || this.rtl === true;
    this.loop = this.loop === 'true' || this.loop === true;
    if (!['top', 'bottom', 'left', 'right'].includes(this.showcasePosition))
      this.showcasePosition = 'bottom';

    if (!['top', 'bottom', 'left', 'right'].includes(this.zoomPosition))
      this.zoomPosition = 'top';

    this.showcaseHorizontal = ['left', 'right'].includes(this.showcasePosition);
  }

  private _changeTransition() {
    this.currentTransition = 300;
    setTimeout(() => {
      this.currentTransition = 0;
    }, 0);
  }
}
