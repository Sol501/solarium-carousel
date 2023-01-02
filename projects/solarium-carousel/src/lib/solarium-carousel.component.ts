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
  @Input() cells_shown: number = 1;
  @Input() zoom: boolean | string = false;
  @Input() zoom_position: string = 'top';
  @Input() showcase: boolean | string = false;
  @Input() showcase_position: string = 'bottom';
  @Input() showcase_accent: string = '#000000';
  @Input() dots: boolean | string = false;
  @Input() arrows: boolean | string = false;
  @Input() autoplay: boolean | string = false;
  @Input() autoplay_interval: number = 1000;
  @Input() image_fit: string = 'contain';
  @Input() rtl: boolean | string = false;
  @Input() loop: boolean | string = false;

  current_transition: number = 0;
  current_content_index: number = 0;
  content_count: number = 0;
  autoplay_disabled: boolean = false;
  showcase_horizontal: boolean = false;
  drag_translate: number = 0;
  is_drag: boolean = false;
  scroll_original: number = 0;
  drag_start: number = 0;

  is_scrolling: boolean = false;
  touch_start_x: number = 0;
  touch_start_y: number = 0;

  // Add a threshold for the distance traveled in the x direction before the carousel's dragging event is triggered
  drag_threshold: number = 100;

  constructor(private router: Router) {}

  ngOnInit(): void {
    document.addEventListener('touchstart', this.onTouchStart);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);

    this.validate_input();

    // TODO: content count can be either images length or children content count
    this.content_count = this.images.length;

    this.current_content_index = this.loop ? 1 : 0;

    if (this.content_count < 2) {
      this.arrows = false;
      this.dots = false;
      this.autoplay = false;
    }

    if (this.autoplay == true)
      setInterval(() => {
        if (!this.autoplay_disabled) this.next();
      }, this.autoplay_interval);
  }

  onTouchStart = (e: any) => {
    this.touch_start_x = e.touches[0].clientX;
    this.touch_start_y = e.touches[0].clientY;
  };

  onTouchMove = (e: any) => {
    this.is_scrolling = true;
    // Calculate the distance traveled in the x directions
    const x_distance = Math.abs(e.touches[0].clientX - this.touch_start_x);
    const y_distance = Math.abs(e.touches[0].clientY - this.touch_start_y);
    // If the distance traveled in the x direction is greater than the threshold distance,
    // it is a horizontal gesture and the carousel's dragging event should be triggered.
    // Otherwise, it is a vertical gesture and the carousel's dragging event should be prevented.
    if (x_distance > this.drag_threshold && x_distance > y_distance) {
      this.is_scrolling = false;
    }
  };

  onTouchEnd = () => {
    this.is_scrolling = false;
  };

  validate_input() {
    this.zoom = this.zoom === 'true' || this.zoom === true;
    this.showcase = this.showcase === 'true' || this.showcase === true;
    this.dots = this.dots === 'true' || this.dots === true;
    this.arrows = this.arrows === 'true' || this.arrows === true;
    this.arrows = this.showcase ? false : this.arrows;
    this.autoplay = this.autoplay === 'true' || this.autoplay === true;
    this.rtl = this.rtl === 'true' || this.rtl === true;
    this.loop = this.loop === 'true' || this.loop === true;
    if (!['top', 'bottom', 'left', 'right'].includes(this.showcase_position))
      this.showcase_position = 'bottom';

    if (!['top', 'bottom', 'left', 'right'].includes(this.zoom_position))
      this.zoom_position = 'top';

    this.showcase_horizontal = ['left', 'right'].includes(
      this.showcase_position
    );
  }

  start_drag(e: any, slider_width: number): void {
    if (this.is_scrolling) return;
    this.autoplay_disabled = true;
    this.is_drag = true;
    this.drag_start = e.pageX || e.touches[0].pageX;
    this.drag_translate = this.current_content_index * slider_width;
    this.scroll_original = this.drag_translate;
  }

  end_drag(slider_width: number) {
    this.autoplay_disabled = false;
    this.is_drag = false;
    let closest_index = Math.round(this.drag_translate / slider_width);
    let loop_index = closest_index;
    if (loop_index < 0) loop_index = 0;
    else if (loop_index > this.content_count + 1)
      loop_index = this.content_count;
    if (this.loop && closest_index > this.content_count) closest_index = 1;
    else if (this.loop && closest_index < 1)
      closest_index = this.content_count - this.cells_shown + 1;
    else if (!this.loop && closest_index >= this.content_count)
      closest_index = this.content_count - this.cells_shown;
    else if (!this.loop && closest_index < 0) closest_index = 0;
    if (this.loop && (loop_index > this.content_count || loop_index < 1)) {
      this.change_current(loop_index);
      setTimeout(() => {
        this.current_content_index = closest_index;
      }, this.current_transition);
    } else this.change_current(closest_index);
  }

  drag_content(e: any): void {
    if (!this.is_drag || this.is_scrolling) return;
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX;
    const dist = x - this.drag_start;
    this.drag_translate = this.scroll_original - dist;
  }

  content_click_action(action?: string) {
    if (!action) return;
    return this.router.navigateByUrl(action);
  }

  enable_autoplay() {
    this.autoplay_disabled = false;
  }

  disable_autoplay() {
    this.autoplay_disabled = true;
  }

  change_transition() {
    this.current_transition = 300;
    setTimeout(() => {
      this.current_transition = 0;
    }, 0);
  }

  check_arrow_visible(condition: boolean) {
    if (
      !this.loop &&
      (this.current_content_index == 0 ||
        this.current_content_index == this.content_count - 1)
    )
      this.enable_autoplay();
    return condition;
  }

  change_current(new_index: number) {
    this.change_transition();
    this.current_content_index = new_index;
  }

  next() {
    this.change_transition();
    this.current_content_index = this.current_content_index + this.cells_shown;
    if (!this.loop && this.current_content_index >= this.content_count) {
      this.current_content_index = this.content_count - this.cells_shown;
    } else if (this.loop && this.current_content_index > this.content_count) {
      setTimeout(() => {
        this.current_content_index =
          this.current_content_index - this.content_count;
      }, this.current_transition);
    }
  }

  previous() {
    this.change_transition();
    this.current_content_index = this.current_content_index - this.cells_shown;
    if (!this.loop && this.current_content_index < 0) {
      this.current_content_index = 0;
    } else if (this.loop && this.current_content_index < 1) {
      setTimeout(() => {
        this.current_content_index = this.content_count - this.cells_shown + 1;
      }, this.current_transition);
    }
  }
}
