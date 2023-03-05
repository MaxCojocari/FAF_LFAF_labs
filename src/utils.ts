export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function compareArrays(arr1: string[], arr2: string[]): boolean {
  return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())
}

export function unionArrays(arr1: string[], arr2: string[]): string[] {
  return [...new Set([...arr1, ...arr2])]
}