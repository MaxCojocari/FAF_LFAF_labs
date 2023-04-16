import { Grammar } from "../Grammar";
import { InaccessibleSymbolRemover } from "../InaccessibleSymbolRemover";
import { LambdaProductionRemover } from "../LambdaProductionRemover";
import { NonProductiveSymbolRemover } from "../NonProductiveSymbolRemover";
import { Production } from "../Production";
import { UnitProductionRemover } from "../UnitProductionRemover";

export class CNFConverter {
    public lambdaProductionRemover: LambdaProductionRemover;
    public unitProductionRemover: UnitProductionRemover;
    public inaccessibleSymbolRemover: InaccessibleSymbolRemover;
    public nonProductiveSymbolRemover: NonProductiveSymbolRemover;

    public constructor() {
        this.lambdaProductionRemover = new LambdaProductionRemover();
        this.unitProductionRemover = new UnitProductionRemover();
        this.inaccessibleSymbolRemover = new InaccessibleSymbolRemover();
        this.nonProductiveSymbolRemover = new NonProductiveSymbolRemover();
    }

    public convertToCNF(G: Grammar) {
        this.checkForStartSymbolInRHS(G);
        this.prepareGrammarForCFN(G);
        let processedProductions: Production[] = [];
        let nonTerminalSymbols;

        // convertProductions to CNF
        [nonTerminalSymbols, processedProductions] = this.convertProductionsToCNF(G);
        processedProductions = this.sortProductions(processedProductions);

        G.setNonTerminalSymbols(nonTerminalSymbols);
        G.setProductions(processedProductions);
        return G;
    }

    public checkForStartSymbolInRHS(grammar: Grammar) {
        let productions;

        for (let p of grammar.productions) {
            if (p.right.split('').includes(grammar.startSymbol)) {
                productions = [
                    new Production('S0', 'S'),
                    ...grammar.productions
                ]
            }
        }
        grammar.setStartSymbol('S0');
        grammar.setNonTerminalSymbols(['S0', ...grammar.nonTerminalSymbols]);
        grammar.setProductions(productions as Production[]);
    }

    public prepareGrammarForCFN(grammar: Grammar) {
        this.lambdaProductionRemover.removeLambdaProductions(grammar);
        this.unitProductionRemover.removeUnitProductions(grammar);
        this.inaccessibleSymbolRemover.removeInaccessibleSymbols(grammar);
        this.nonProductiveSymbolRemover.removeNonProductiveSymbols(grammar);

        const sortedProductions = this.sortProductions(grammar.productions);
        grammar.setProductions(sortedProductions);
    }

    public convertProductionsToCNF(G: Grammar): [string[], Production[]] {
        let newProductions;
        let asciiVal = G.nonTerminalSymbols[G.nonTerminalSymbols.length - 1].charCodeAt(0);
        let productions = G.productions;
        let terminalSymbols = G.terminalSymbols;
        let nonTerminalSymbols = [...G.nonTerminalSymbols];
        let newProduction;
        let processedProductions: Production[];
        let iterations = 0;

        while (!this.isGrammarInCNF(productions, terminalSymbols, nonTerminalSymbols)) {
            iterations++;
            processedProductions = [];
            for (let p of productions) {
                if (this.isProductionNormalized(p, terminalSymbols, nonTerminalSymbols)) {
                    processedProductions.push(p);
                    continue;
                };
                [asciiVal, newProduction, newProductions] =
                    this.splitProduction(
                        p,
                        asciiVal,
                        nonTerminalSymbols,
                        G.nonTerminalSymbols,
                        terminalSymbols,
                        iterations == 1 ? processedProductions : productions
                    );
                processedProductions = [...processedProductions, newProduction, ...newProductions]
            }
            productions = [...processedProductions];
        }

        return [nonTerminalSymbols, productions];
    }

    public splitProduction(
        production: Production,
        asciiVal: number,
        nonTerminalSymbols: string[],
        originalNonTerminalSymbols: string[],
        terminalSymbols: string[],
        processedProductions: Production[],
    ): [number, Production, Production[]] {
        let newRHS: string = '';
        let newProductions: Production[] = [];
        const firstPart = production.right[0];
        const secondPart = production.right.slice(1);

        // analyze first half
        // find if there is production with resulting first half
        let analogueProductionFirstHalf = this.findTransitionWithRHS(firstPart, processedProductions)
        analogueProductionFirstHalf = analogueProductionFirstHalf.filter(p => !originalNonTerminalSymbols.includes(p.left))

        // if yes => reuse it!
        if (analogueProductionFirstHalf.length != 0) {
            newRHS += analogueProductionFirstHalf[0]?.left;
            // if no => create new production
        } else {
            // if first symbol is terminal
            if (terminalSymbols.includes(firstPart)) {
                // create new production
                // check to not repeat already existent non terminal symbols
                asciiVal++;
                if (nonTerminalSymbols.includes(String.fromCharCode(asciiVal))) asciiVal++;
                newProductions.push(new Production(String.fromCharCode(asciiVal), firstPart));
                nonTerminalSymbols.push(String.fromCharCode(asciiVal));
                newRHS += String.fromCharCode(asciiVal);

                // if first symbol is non-terminal
            } else if (nonTerminalSymbols.includes(firstPart)) {
                newRHS += firstPart;
            }
        }

        // analyze second half
        // check if there is production with resulting second half
        let analogueProductionSecondHalf = this.findTransitionWithRHS(secondPart, processedProductions)
        analogueProductionSecondHalf = analogueProductionSecondHalf.filter(p => !originalNonTerminalSymbols.includes(p.left));

        // if yes => reuse it!
        if (analogueProductionSecondHalf.length != 0) {

            newRHS += analogueProductionSecondHalf[0]?.left;
            // if last symbol is terminal, stop
        } else if (secondPart.length == 1 && nonTerminalSymbols.includes(secondPart)) {
            newRHS += secondPart;
            // if not => create new production
        } else {
            asciiVal++;
            if (nonTerminalSymbols.includes(String.fromCharCode(asciiVal))) asciiVal++;
            newProductions.push(new Production(String.fromCharCode(asciiVal), secondPart));
            nonTerminalSymbols.push(String.fromCharCode(asciiVal));
            newRHS += String.fromCharCode(asciiVal);
        }

        return [asciiVal, new Production(production.left, newRHS), newProductions];
    }

    public sortProductions(productions: Production[]): Production[] {
        const sortedProductions = [
            ...productions.filter(p => p.left === 'S0'),
            ...productions.filter(p => p.left === 'S'),
            ...productions.filter(p => p.left !== 'S0' && p.left !== 'S').sort((p1, p2) => (p1.left < p2.left ? -1 : 1))
        ]
        return sortedProductions;
    }

    public isGrammarInCNF(productions: Production[], terminalSymbols: string[], nonTerminalSymbols: string[]): boolean {
        for (let p of productions) {
            if (!this.isProductionNormalized(p, terminalSymbols, nonTerminalSymbols))
                return false;
        }
        return true;
    }

    public isProductionNormalized(production: Production, terminalSymbols: string[], nonTerminalSymbols: string[]) {
        const tokenizedRHS = production.right.split('');
        return tokenizedRHS.length == 1 && terminalSymbols.includes(tokenizedRHS[0]) ||
            tokenizedRHS.length == 2 && tokenizedRHS.every(val => nonTerminalSymbols.includes(val));
    }

    public findTransitionWithRHS(sequence: string, producions: Production[]): Production[] {
        return producions.filter(p => p.right === sequence)
    }
}