import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  SolariumImage,
  SolariumCarouselOptions,
  DEFAULT_OPTIONS,
} from "./_models";

@Component({
  selector: "sol-solarium-carousel",
  templateUrl: "./solarium-carousel.component.html",
  styleUrls: ["./solarium-carousel.component.scss"],
  standalone: true,
  imports: [],
})
export class SolariumCarouselComponent implements OnInit {
  @Input({
    transform: (value: Array<SolariumImage | string>) => {
      const transformedValue: Array<SolariumImage> = [];
      value.forEach((value: SolariumImage | string) => {
        transformedValue.push(
          typeof value === "string" ? { src: value } : value
        );
      });
      return transformedValue;
    },
  })
  images: Array<SolariumImage> = [];

  @Input({ transform: (value: SolariumCarouselOptions) => ({
    cellsShown: value.cellsShown?? DEFAULT_OPTIONS.cellsShown,
    displayShowcase: value.displayShowcase?? DEFAULT_OPTIONS.displayShowcase,
    showcasePosition: value.showcasePosition?? DEFAULT_OPTIONS.showcasePosition,
    showcaseAccent: value.showcaseAccent?? DEFAULT_OPTIONS.showcaseAccent,
    displayDots: value.displayDots?? DEFAULT_OPTIONS.displayDots,
    displayArrows: value.displayArrows?? DEFAULT_OPTIONS.displayArrows,
    autoplay: value.autoplay?? DEFAULT_OPTIONS.autoplay,
    autoplayInterval: value.autoplayInterval?? DEFAULT_OPTIONS.autoplayInterval,
    imageFit: value.imageFit?? DEFAULT_OPTIONS.imageFit,
    rtl: value.rtl?? DEFAULT_OPTIONS.rtl,
    loop: value.loop?? DEFAULT_OPTIONS.loop,
  }) })
  options: SolariumCarouselOptions = DEFAULT_OPTIONS;

  currentTransition: number = 0;
  currentContentIndex: number = 0;
  contentCount: number = 0;
  showcaseHorizontal: boolean = false;
  dragTranslate: number = 0;
  isDrag: boolean = false;

  onChange: any = () => {};
  onTouch: any = () => {};

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
    document.addEventListener("touchstart", this.onTouchStart);
    document.addEventListener("touchmove", this.onTouchMove);
    document.addEventListener("touchend", this.onTouchEnd);

    // TODO: content count can be either images length or children content count
    this.contentCount = this.images.length;

    this.onValueChanges(this.options.loop ? 1 : 0);

    if (this.contentCount < 2) {
      this.options.displayArrows = false;
      this.options.displayDots = false;
      this.options.autoplay = false;
    }

    if (this.options.autoplay == true)
      setInterval(() => {
        if (!this._autoplayDisabled) this.next();
      }, this.options.autoplayInterval);
  }

  writeValue(obj: number): void {
    this.currentContentIndex = obj;
  }

  onValueChanges(index: number): void {
    this.currentContentIndex = index;
    this.onChange(this.currentContentIndex);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
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
    if (this.options.loop && closest_index > this.contentCount)
      closest_index = 1;
    else if (this.options.loop && closest_index < 1)
      closest_index = this.contentCount - (this.options.cellsShown ?? 0) + 1;
    else if (!this.options.loop && closest_index >= this.contentCount)
      closest_index = this.contentCount - (this.options.cellsShown ?? 0);
    else if (!this.options.loop && closest_index < 0) closest_index = 0;
    if (
      this.options.loop &&
      (loop_index > this.contentCount || loop_index < 1)
    ) {
      this.changeCurrent(loop_index);
      setTimeout(() => {
        this.onValueChanges(closest_index);
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
      !this.options.loop &&
      (this.currentContentIndex == 0 ||
        this.currentContentIndex == this.contentCount - 1)
    )
      this.enableAutoplay();
    return condition;
  }

  changeCurrent(new_index: number) {
    this._changeTransition();
    this.onValueChanges(new_index);
  }

  next() {
    this._changeTransition();
    this.onValueChanges(
      this.currentContentIndex + (this.options.cellsShown ?? 0)
    );
    if (!this.options.loop && this.currentContentIndex >= this.contentCount) {
      this.onValueChanges(this.contentCount - (this.options.cellsShown ?? 0));
    } else if (
      this.options.loop &&
      this.currentContentIndex > this.contentCount
    ) {
      setTimeout(() => {
        this.onValueChanges(this.currentContentIndex - this.contentCount);
      }, this.currentTransition);
    }
  }

  previous() {
    this._changeTransition();
    this.onValueChanges(
      this.currentContentIndex - (this.options.cellsShown ?? 0)
    );
    if (!this.options.loop && this.currentContentIndex < 0) {
      this.onValueChanges(0);
    } else if (this.options.loop && this.currentContentIndex < 1) {
      setTimeout(() => {
        this.onValueChanges(
          this.contentCount - (this.options.cellsShown ?? 0) + 1
        );
      }, this.currentTransition);
    }
  }

  private _changeTransition() {
    this.currentTransition = 300;
    setTimeout(() => {
      this.currentTransition = 0;
    }, 0);
  }
}
