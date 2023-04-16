import { Grammar } from "./Grammar";
import { Production } from "./Production";
import { getAllPossibleReplacements, getCombinations } from "./utils";

export class LambdaProductionRemover {
    public removeLambdaProductions(grammar: Grammar) {
        let productions: Production[] = grammar.productions;

        while (this.isThereLambdaProduction(productions)) {
            const [indexToRemove, lambdaProduction] = this.getNextLambdaProduction(productions);

            // remove lambda production found
            productions =
                [
                    ...productions.slice(0, indexToRemove),
                    ...productions.slice(indexToRemove + 1)
                ]

            if (lambdaProduction?.left === grammar.startSymbol) continue;

            // replace lambda productions with new productions that generate 
            // all possible combinations of non-terminals that don't include the empty string
            productions.forEach(p => {
                this.substituteAllLambdaCombinations(p, lambdaProduction as Production, productions);
            });
        }

        grammar.setProductions(productions);
    }

    public substituteAllLambdaCombinations(targetProduction: Production, lambdaProduction: Production, productions: Production[]) {
        const indices = [
            ...targetProduction.right.matchAll(new RegExp(lambdaProduction?.left as string, 'g'))
        ].map(a => a.index);

        const indicesPossibleCombinations: number[][] = getCombinations(indices as number[]);
        const newRHS = getAllPossibleReplacements(indicesPossibleCombinations, targetProduction.right, '')

        newRHS?.forEach(newRightSide => {
            productions.push(new Production(targetProduction.left, newRightSide))
        });
    }

    public getNextLambdaProduction(productions: Production[]): [number, Production | null] {
        for (let i = 0; i < productions.length; ++i) {
            if (this.isLambdaProduction(productions[i])) return [i, productions[i]];
        }
        return [productions.length, null];
    }

    public isThereLambdaProduction(productions: Production[]): boolean {
        for (let p of productions) {
            if (this.isLambdaProduction(p)) return true;
        }
        return false;
    }

    public isLambdaProduction(production: Production): boolean {
        return production.right === '';
    }

}