let counter = 0;

export function uniqueId(prefix = ''): string {
  counter++;
  return `${prefix}${counter}`;
}
