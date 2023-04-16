import { Production } from "./Production";

export function getCombinations(arr: number[]): number[][] {
    let combinations: number[][] = [];
    for (let r = 1; r <= arr.length; r++) {
        let newCombinations = combinationsOfFixedLength(arr, r);
        combinations = combinations.concat(newCombinations);
    }
    return combinations;
}

export function combinationsOfFixedLength(arr: number[], r: number) {
    if (r === 1) {
        return arr.map((el) => [el]);
    }

    let combinations: number[][] = [];
    for (let i = 0; i <= arr.length - r; ++i) {
        let firstElement = arr[i];
        let restOfElements = arr.slice(i + 1);
        let restCombinations = combinationsOfFixedLength(restOfElements, r - 1);
        let combined: number[][] = restCombinations.map((el) => [firstElement, ...el]);
        combinations = combinations.concat(combined);
    }
    return combinations;
}

export function getAllPossibleReplacements(indices: number[][], target: string, replacement: string): string[] {
    let result = new Set<string>();
    indices.forEach(arr => {
        result.add(replaceCharacter(target, arr, replacement));
    });
    return [...result];
}

export function replaceCharacter(initialStr: string, positions: number[], replacement: string): string {
    let digest: string = initialStr;
    for (let i = 0; i < positions.length; ++i) {
        digest =
            digest.slice(0, positions[i] + (replacement.length - 1) * i) +
            replacement +
            initialStr.slice(positions[i] + 1, initialStr.length);
    }
    return digest;
}

export function getProductionBySymbol(productions: Production[], symbol: string): [number, Production | null] {
    for (let i = 0; i < productions.length; ++i) {
        if (isThereUselessSymbol(productions[i], symbol)) return [i, productions[i]];
    }
    return [productions.length, null];
}

export function isRemovalComplete(productions: Production[], symbol: string): boolean {
    for (let p of productions) {
        if (isThereUselessSymbol(p, symbol)) return false;
    }
    return true;
}

export function isThereUselessSymbol(production: Production, symbol: string): boolean {
    return production.left.includes(symbol) || production.right.includes(symbol);
}