import { getRandomInt } from "../utils";
import { Production } from "./Production";

export class Grammar {
    public nonTerminalSymbols: string[];
    public terminalSymbols: string[];
    public productions: Production[];
    public startSymbol: string;
    public transitionMap: Map<string, string[]>;

    public constructor(
        nonTerminalSymbols: string[],
        terminalSymbols: string[],
        productions: Production[],
        startSymbol: string
    ) {
        this.nonTerminalSymbols = nonTerminalSymbols;
        this.terminalSymbols = terminalSymbols;
        this.productions = productions;
        this.startSymbol = startSymbol;
        this.transitionMap = Grammar.genTransitionMap(productions);
    }

    public static genTransitionMap(productions: Production[]): Map<string, string[]> {
        let newTransitionMap = new Map<string, string[]>();
        productions.forEach(p => {
            if (newTransitionMap.has(p.left)) {
                let states = newTransitionMap.get(p.left);
                states?.push(p.right)
            } else {
                newTransitionMap.set(p.left, [p.right]);
            }
        })
        return newTransitionMap;
    }

    public genWord(): string {
        let nextStates: any = this.transitionMap.get(this.startSymbol);
        let randInt: number = getRandomInt(nextStates.length as number);
        let word: string = nextStates[randInt];
        while (word !== word.toLowerCase()) {
            const index = word.search(/[A-Z]/);
            const nonTerminalSymbol = word[index];
            word = word.slice(0, index) + this.getNextState(nonTerminalSymbol) + word.slice(index + 1);
        }
        return word;
    }

    public getNextState(initState: string): string {
        let nextStates: any = this.transitionMap.get(initState);
        let randInt: number = getRandomInt(nextStates.length as number);
        return nextStates[randInt];
    }

    public setNonTerminalSymbols(nonTerminalSymbols: string[]) {
        this.nonTerminalSymbols = nonTerminalSymbols;
    }

    public setTerminalSymbols(terminalSymbols: string[]) {
        this.terminalSymbols = terminalSymbols;
    }

    public setProductions(productions: Production[]) {
        this.productions = productions;
        this.transitionMap = Grammar.genTransitionMap(productions);
    }

    public setStartSymbol(startSymbol: string) {
        this.startSymbol = startSymbol;
    }
}