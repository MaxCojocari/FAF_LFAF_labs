import { FiniteAutomaton } from "../automation/FiniteAutomaton";
import { Transition } from "../automation/Transition";
import { getRandomInt } from "../utils";
import { Production } from "./Production";

export class Grammar {
  public readonly nonTerminalSymbols: string[];
  public readonly terminalSymbols: string[];
  public readonly productions: Production[];
  public readonly startSymbol: string;
  public readonly transitionMap: Map<string, string[]>;

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

  public toFiniteAutomation(): FiniteAutomaton {
    // set of states
    let Q = [...this.nonTerminalSymbols].concat(['X']);

    // alphabet
    let sigma = this.terminalSymbols;

    // transition function
    let delta: Transition[] = [];
    this.productions.forEach(p => {
      const index = p.right.search(/[A-Z]/);

      // final state
      if (index == -1) {
        delta.push(
          new Transition(p.left, p.right, 'X')
        )

        // left regular grammar
      } else if (index == 0) {
        delta.push(
          new Transition(
            p.left,
            p.right.slice(1),
            p.right[0] ? p.right[0] : '',
          )
        )

        // right regular grammar
      } else {
        delta.push(
          new Transition(
            p.left,
            p.right.slice(0, index),
            p.right[index] ? p.right[index] : '',
          )
        )
      }
    });

    // initial state
    let q0 = 'S'

    // final state
    let F = 'X'

    return new FiniteAutomaton(Q, sigma, delta, q0, F);
  };

  public getNextState(initState: string): string {
    let nextStates: any = this.transitionMap.get(initState);
    let randInt: number = getRandomInt(nextStates.length as number);
    return nextStates[randInt];
  }
}