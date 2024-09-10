import {
  DEFAULT_OPTIONS,
  SolariumCarouselOptions,
  SolariumImageFitEnum,
  SolariumPositionEnum,
} from "../_models";
import { convertToBoolean } from "./convert-to-boolean";
import { convertToNumber } from "./convert-to-number";
import { convertToStringEnum } from "./convert-to-string-enum";

export function transformOptionsInput(value: any): SolariumCarouselOptions {
  return {
    cellsShown: convertToNumber(
      value.cellsShown,
      DEFAULT_OPTIONS.cellsShown ?? 0
    ),
    transitionSpeed: convertToNumber(
      value.transitionSpeed,
      DEFAULT_OPTIONS.transitionSpeed ?? 0
    ),
    displayShowcase: convertToBoolean(
      value.displayShowcase,
      !!DEFAULT_OPTIONS.displayShowcase
    ),
    showcasePosition: convertToStringEnum(
      value.showcasePosition,
      SolariumPositionEnum,
      DEFAULT_OPTIONS.showcasePosition ?? ""
    ) as SolariumPositionEnum,
    showcaseSizePercentage: convertToNumber(
      value.showcaseSizePercentage,
      DEFAULT_OPTIONS.showcaseSizePercentage ?? 0
    ),
    showcaseAccent: value.showcaseAccent ?? DEFAULT_OPTIONS.showcaseAccent,
    displayDots: convertToBoolean(
      value.displayDots,
      !!DEFAULT_OPTIONS.displayDots
    ),
    displayArrows: convertToBoolean(
      value.displayArrows,
      !!DEFAULT_OPTIONS.displayArrows
    ),
    autoplay: convertToBoolean(value.autoplay, !!DEFAULT_OPTIONS.autoplay),
    autoplayInterval: convertToNumber(
      value.autoplayInterval,
      DEFAULT_OPTIONS.autoplayInterval ?? 0
    ),
    imageFit: convertToStringEnum(
      value.imageFit,
      SolariumImageFitEnum,
      DEFAULT_OPTIONS.imageFit ?? ""
    ) as SolariumImageFitEnum,
    rtl: convertToBoolean(value.rtl, !!DEFAULT_OPTIONS.rtl),
    loop: convertToBoolean(value.loop, !!DEFAULT_OPTIONS.loop),
  };
}