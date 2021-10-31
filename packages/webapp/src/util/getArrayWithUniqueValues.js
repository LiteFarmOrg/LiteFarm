export function getArrayWithUniqueValues(array) {
  return Array.from(new Set(array).values(), (item) => item);
}
