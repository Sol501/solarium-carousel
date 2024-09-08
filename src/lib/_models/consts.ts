import {
  SolariumCarouselOptions,
  SolariumPositionEnum,
  SolariumImageFitEnum,
} from "./";

export const DEFAULT_TRANSITION_SPEED: number = 300;

export const DEFAULT_OPTIONS: SolariumCarouselOptions = {
  cellsShown: 1,
  transitionSpeed: DEFAULT_TRANSITION_SPEED,
  displayShowcase: false,
  showcasePosition: SolariumPositionEnum.Bottom,
  showcaseAccent: "#000000",
  displayDots: false,
  displayArrows: false,
  autoplay: false,
  autoplayInterval: 1000,
  imageFit: SolariumImageFitEnum.Contain,
  rtl: false,
  loop: false,
}; 

/**
 * @description
 * Add a threshold for the distance traveled in the x direction before
 * the carousel's dragging event is triggered
 */
export const DRAG_THRESHOLD: number = 100;
