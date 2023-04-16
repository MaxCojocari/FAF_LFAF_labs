import { areEqual, differenceArrays, unionArrays } from "../utils";
import { Grammar } from "./Grammar";
import { Production } from "./Production";
import { getProductionBySymbol, isRemovalComplete } from "./utils";

export class InaccessibleSymbolRemover {

    public removeInaccessibleSymbols(grammar: Grammar) {
        const inaccessibleSymbols: string[] = this.getInaccessibleSymbols(grammar);
        let filteredProductions: Production[] = grammar.productions;
        let filteredTerminalSymbols: string[] = grammar.terminalSymbols;
        let filteredNonTerminalSymbols: string[] = grammar.nonTerminalSymbols;

        inaccessibleSymbols.forEach(inaccessibleSymbol => {
            [filteredTerminalSymbols, filteredNonTerminalSymbols] =
                this.removeInaccessibleSymbol(inaccessibleSymbol, filteredTerminalSymbols, filteredNonTerminalSymbols);

            while (!isRemovalComplete(filteredProductions, inaccessibleSymbol)) {
                const [indexToRemove] = getProductionBySymbol(filteredProductions, inaccessibleSymbol);
                filteredProductions =
                    [
                        ...filteredProductions.slice(0, indexToRemove),
                        ...filteredProductions.slice(indexToRemove + 1)
                    ]
            }
        });

        grammar.setNonTerminalSymbols(filteredNonTerminalSymbols);
        grammar.setTerminalSymbols(filteredTerminalSymbols);
        grammar.setProductions(filteredProductions);
    }

    public getInaccessibleSymbols(grammar: Grammar): string[] {
        let Ac: string[] = [grammar.startSymbol];
        let prevAc: string[] = [];
        const transitionMap = grammar.transitionMap;

        while (!areEqual(prevAc, Ac)) {
            prevAc = Ac;
            prevAc.forEach(symbol => {
                const allRHS = transitionMap.get(symbol);
                allRHS?.forEach(rhs => {
                    Ac = unionArrays(Ac, rhs.split(''))
                });
            });
        }

        const inaccessibleSymbols = differenceArrays(
            unionArrays(grammar.terminalSymbols, grammar.nonTerminalSymbols), Ac
        );

        return inaccessibleSymbols;
    }

    public removeInaccessibleSymbol(
        symbol: string,
        terminalSymbols: string[],
        nonTerminalSymbols: string[]
    ): [string[], string[]] {
        if (terminalSymbols.includes(symbol)) {
            terminalSymbols = terminalSymbols.filter(e => e !== symbol)
        } else if (nonTerminalSymbols.includes(symbol)) {
            nonTerminalSymbols = nonTerminalSymbols.filter(e => e !== symbol)
        }

        return [terminalSymbols, nonTerminalSymbols];
    }
}