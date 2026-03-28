const STABLE_ID_PATTERN = /^[a-z0-9-]+$/i;

export function isStableId(value: string): boolean {
  return STABLE_ID_PATTERN.test(value);
}
