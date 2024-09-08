export interface SolariumCarouselOptions {
  cellsShown?: number;
  transitionSpeed?: number;
  displayShowcase?: boolean;
  showcasePosition?: SolariumPositionEnum;
  showcaseAccent?: string;
  displayDots?: boolean;
  displayArrows?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  imageFit?: SolariumImageFitEnum;
  rtl?: boolean;
  loop?: boolean;
}

export enum SolariumImageFitEnum {
  Contain = "contain",
  Cover = "cover",
  Fill = "fill",
  None = "none",
  ScaleDown = "scale-down"
}

export enum SolariumPositionEnum {
  Left = "left",
  Right = "right",
  Top = "top",
  Bottom = "bottom",
}