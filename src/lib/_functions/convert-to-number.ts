export function convertToNumber(value: any, fallbackValue: number): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = +value;
    return isNaN(parsedValue)? fallbackValue : parsedValue;
  }

  return fallbackValue;
}