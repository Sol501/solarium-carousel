import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  SolariumImage,
  SolariumCarouselOptions,
  DEFAULT_OPTIONS,
  DRAG_THRESHOLD,
  DEFAULT_TRANSITION_SPEED,
} from "./_models";
import { interval, Subject, takeUntil, timer } from "rxjs";
import { NgClass } from "@angular/common";
import { transformImageInput, transformOptionsInput } from "./_functions";

@Component({
  selector: "sol-solarium-carousel",
  templateUrl: "./solarium-carousel.component.html",
  styleUrls: ["./solarium-carousel.component.scss"],
  standalone: true,
  imports: [NgClass],
})
export class SolariumCarouselComponent implements OnInit, OnDestroy {
  @Input({
    transform: transformImageInput,
  })
  images: Array<SolariumImage> = [];

  @Input({
    transform: transformOptionsInput,
  })
  options: SolariumCarouselOptions = DEFAULT_OPTIONS;

  @Output() contentChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() contentClick: EventEmitter<number> = new EventEmitter<number>();

  destroy$: Subject<boolean> = new Subject<boolean>();

  currentContentIndex = signal<number>(0);
  currentTransition = signal<number>(0);
  contentCount = computed<number>(() => this.images?.length);
  showcaseSizePercentage = computed<number>(this._computeShowcaseSizePercentage);
  sliderSizePercentage = computed<number>(
    () => 1 - this.showcaseSizePercentage()
  );

  showcaseHorizontal: boolean = false;
  dragTranslate: number = 0;
  isDrag: boolean = false;

  private _autoplayDisabled: boolean = false;
  private _scrollOriginal: number = 0;
  private _dragStart: number = 0;
  private _isScrolling: boolean = false;
  private _touchStartX: number = 0;
  private _touchStartY: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this._initListeners();

    this._changeCurrentContent(this.options.loop ? 1 : 0);

    this._setupAutoplay();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this._removeListeners();
  }

  onDragStart(e: any, sliderWidth: number): void {
    if (this._isScrolling) {
      return;
    }
    this._autoplayDisabled = true;
    this.isDrag = true;
    this._dragStart = e.pageX || e.touches[0].pageX;
    this.dragTranslate = this.currentContentIndex() * sliderWidth;
    this._scrollOriginal = this.dragTranslate;
  }

  onDragEnd(sliderWidth: number): void {
    this._autoplayDisabled = false;
    this.isDrag = false;
    let closestIndex = Math.round(this.dragTranslate / sliderWidth);
    let loopIndex = closestIndex;
    if (loopIndex < 0) {
      loopIndex = 0;
    } else if (loopIndex > this.contentCount() + 1) {
      loopIndex = this.contentCount();
    }

    if (this.options.loop && closestIndex > this.contentCount()) {
      closestIndex = 1;
    } else if (this.options.loop && closestIndex < 1) {
      closestIndex = this.contentCount() - (this.options.cellsShown ?? 0) + 1;
    } else if (!this.options.loop && closestIndex >= this.contentCount()) {
      closestIndex = this.contentCount() - (this.options.cellsShown ?? 0);
    } else if (!this.options.loop && closestIndex < 0) {
      closestIndex = 0;
    }

    if (
      this.options.loop &&
      (loopIndex > this.contentCount() || loopIndex < 1)
    ) {
      this.jumpToIndex(loopIndex);
      this._setTimeout(() => {
        this._changeCurrentContent(closestIndex);
      }, this.currentTransition());
    } else {
      this.jumpToIndex(closestIndex);
    }
  }

  onContentDrag(e: any): void {
    if (!this.isDrag || this._isScrolling) {
      return;
    }
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX;
    const dist = x - this._dragStart;
    this.dragTranslate = this._scrollOriginal - dist;
  }

  onContentClick(index: number): void {
    this.contentClick.emit(index);
    const actionUrl = this.images[index]?.actionUrl;
    if (this.images[index]?.actionUrl) {
      this.router.navigateByUrl(actionUrl ?? "");
    }
  }

  enableAutoplay(): void {
    this._autoplayDisabled = false;
  }

  disableAutoplay(): void {
    this._autoplayDisabled = true;
  }

  jumpToIndex(newIndex: number): void {
    this._changeTransition();
    this._changeCurrentContent(newIndex);
  }

  next(): void {
    this._changeTransition();
    this._changeCurrentContent(
      this.currentContentIndex() + (this.options.cellsShown ?? 0)
    );
    if (
      !this.options.loop &&
      this.currentContentIndex() >= this.contentCount()
    ) {
      this._changeCurrentContent(
        this.contentCount() - (this.options.cellsShown ?? 0)
      );
    } else if (
      this.options.loop &&
      this.currentContentIndex() > this.contentCount()
    ) {
      this._setTimeout(() => {
        this._changeCurrentContent(
          this.currentContentIndex() - this.contentCount()
        );
      }, this.currentTransition());
    }
  }

  previous(): void {
    this._changeTransition();
    this._changeCurrentContent(
      this.currentContentIndex() - (this.options.cellsShown ?? 0)
    );
    if (!this.options.loop && this.currentContentIndex() < 0) {
      this._changeCurrentContent(0);
    } else if (this.options.loop && this.currentContentIndex() < 1) {
      this._setTimeout(() => {
        this._changeCurrentContent(
          this.contentCount() - (this.options.cellsShown ?? 0) + 1
        );
      }, this.currentTransition());
    }
  }

  private _onTouchStart(e: TouchEvent): void {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
  }

  private _onTouchMove(e: TouchEvent): void {
    // Calculate the distance traveled in the x directions
    const xDistance = Math.abs(e.touches[0].clientX - this._touchStartX);
    const yDistance = Math.abs(e.touches[0].clientY - this._touchStartY);
    // If the distance traveled in the x direction is greater than the threshold distance,
    // it is a horizontal gesture and the carousel's dragging event should be triggered.
    // Otherwise, it is a vertical gesture and the carousel's dragging event should be prevented.
    this._isScrolling = xDistance <= DRAG_THRESHOLD || xDistance <= yDistance;
  }

  private _onTouchEnd(): void {
    this._isScrolling = false;
  }

  private _initListeners(): void {
    document.addEventListener("touchstart", this._onTouchStart);
    document.addEventListener("touchmove", this._onTouchMove);
    document.addEventListener("touchend", this._onTouchEnd);
  }

  private _removeListeners(): void {
    document.removeEventListener("touchstart", this._onTouchStart);
    document.removeEventListener("touchmove", this._onTouchMove);
    document.removeEventListener("touchend", this._onTouchEnd);
  }

  private _changeCurrentContent(index: number): void {
    this.currentContentIndex.set(index);
    this.contentChange.emit(index);
  }

  private _setupAutoplay(): void {
    if (!this.options.autoplay) {
      return;
    }
    interval(this.options.autoplayInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.contentCount() <= 1 || this._autoplayDisabled) {
          return;
        }
        this.next();
      });
  }

  private _changeTransition(): void {
    const transitionSpeed: number =
      this.options.transitionSpeed ?? DEFAULT_TRANSITION_SPEED;

    this.currentTransition.set(transitionSpeed);

    this._setTimeout(() => {
      this.currentTransition.set(0);
    });
  }

  private _computeShowcaseSizePercentage(): number {
    const highestPercentage = 100;
    const lowestPercentage = 0;
    const percentage: number =
      (this.options?.showcaseSizePercentage ?? lowestPercentage) /
      highestPercentage;
    return Math.max(Math.min(percentage, highestPercentage), lowestPercentage);
  }

  private _setTimeout(callback: () => void, timeout: number = 0): void {
    timer(timeout).pipe(takeUntil(this.destroy$)).subscribe(callback);
  }
}
