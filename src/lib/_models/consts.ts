import {
  SolariumCarouselOptions,
  SolariumPositionEnum,
  SolariumImageFitEnum,
} from "./";

export const DEFAULT_OPTIONS: SolariumCarouselOptions = {
  cellsShown: 1,
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