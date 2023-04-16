import { areEqual, checkSubset, differenceArrays, unionArrays } from "../utils";
import { Grammar } from "./Grammar";
import { Production } from "./Production";
import { getProductionBySymbol, isRemovalComplete } from "./utils";

export class NonProductiveSymbolRemover {
    public removeNonProductiveSymbols(grammar: Grammar) {
        const Pr: string[] = this.getProductiveSymbolsSet(grammar);
        const N: string[] = differenceArrays(grammar.nonTerminalSymbols, Pr);
        let filteredProductions = grammar.productions;
        let filteredNonTerminalSymbols: string[] = grammar.nonTerminalSymbols;

        N.forEach(nonProductiveSymbol => {
            [filteredNonTerminalSymbols, filteredProductions] =
                this.removeNonProductiveSymbol(filteredNonTerminalSymbols, nonProductiveSymbol, filteredProductions);
        });

        grammar.setNonTerminalSymbols(filteredNonTerminalSymbols);
        grammar.setProductions(filteredProductions);
    }

    public removeNonProductiveSymbol(
        filteredNonTerminalSymbols: string[],
        nonProductiveSymbol: string,
        filteredProductions: Production[]
    ): [string[], Production[]] {
        filteredNonTerminalSymbols = filteredNonTerminalSymbols.filter(e => e !== nonProductiveSymbol);

        while (!isRemovalComplete(filteredProductions, nonProductiveSymbol)) {
            const [indexToRemove] = getProductionBySymbol(filteredProductions, nonProductiveSymbol);
            filteredProductions =
                [
                    ...filteredProductions.slice(0, indexToRemove),
                    ...filteredProductions.slice(indexToRemove + 1)
                ]
        }

        return [filteredNonTerminalSymbols, filteredProductions];
    }

    public getProductiveSymbolsSet(grammar: Grammar): string[] {
        let Pr: string[] = [];
        let previousPr: string[] = [];

        // for all productions A -> α, where α ∈ VT*, A is also added
        for (let p of grammar.productions) {
            const symbolsRHS = p.right.split('');
            if (checkSubset(grammar.terminalSymbols, symbolsRHS)) {
                Pr.push(p.left);
            }
        }

        // for all productions B -> β, where β ∈ (VT U Pr), B is also added
        // and if Pr does not change, stop
        while (!areEqual(previousPr, Pr)) {
            previousPr = Pr
            for (let p of grammar.productions) {
                if (this.checkRhsForProductiveSymbols(p.right, Pr, grammar.terminalSymbols)) {
                    Pr = unionArrays(Pr, [p.left]);
                };
            }
        }
        return Pr;
    }

    private checkRhsForProductiveSymbols(RHS: string, Pr: string[], terminalSymbols: string[]): boolean {
        return checkSubset(unionArrays(Pr, terminalSymbols), RHS.split(''));
    }
}