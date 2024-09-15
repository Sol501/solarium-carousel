type enumType = { [s: string]: string } | ArrayLike<string>;

export function convertToStringEnum(
  value: any,
  targetEnum: enumType,
  fallbackValue: string
): string {
  if (!Object.values<string>(targetEnum).includes(value)) {
    return fallbackValue;
  }
  return value;
}