export function convertToBoolean(value: any, fallbackValue: boolean = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallbackValue;
}