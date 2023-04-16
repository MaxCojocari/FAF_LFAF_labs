export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function areEqual(arr1: string[], arr2: string[]): boolean {
  return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())
}

export function unionArrays(arr1: string[], arr2: string[]): string[] {
  return [...new Set([...arr1, ...arr2])]
}

export function differenceArrays(arr1: string[], arr2: string[]): string[] {
  if (arr1.length < arr2.length) {
    throw new Error('Array length mismatch!')
  }
  const set1 = new Set([...arr1]);
  const set2 = new Set([...arr2]);
  return [...new Set(
    [...set1].filter(element => !set2.has(element))
  )];
}

export function checkSubset(parentArray: string[], subsetArray: string[]): boolean {
  const set = new Set(parentArray);
  return subsetArray.every(x => set.has(x));
}