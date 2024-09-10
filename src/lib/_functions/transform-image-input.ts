import { SolariumImage } from "../_models";

export function transformImageInput(
  value: Array<SolariumImage | string>
): Array<SolariumImage> {
  const transformedValue: Array<SolariumImage> = [];
  value.forEach((value: SolariumImage | string) => {
    transformedValue.push(typeof value === "string" ? { src: value } : value);
  });
  return transformedValue;
}