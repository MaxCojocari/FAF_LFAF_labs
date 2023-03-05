import { Grammar } from "../../grammar/Grammar";
import { Production } from "../../grammar/Production";
import { FiniteAutomaton } from "../FiniteAutomaton";

export class AutomatonToGrammarConvertor {
  public static toRegularGrammar(FA: FiniteAutomaton): Grammar {
    let nonTerminalSymbols = FA.setOfStates;
    let terminalSymbols = FA.alphabet;
    let startSymbol = FA.intialState;
    let productions = this.getProductions(FA);
    return new Grammar(nonTerminalSymbols, terminalSymbols, productions, startSymbol);
  }

  public static getProductions(FA: FiniteAutomaton): Production[] {
    let productions: Production[] = [];
    const transitions = FA.transitions;

    transitions.forEach(t => {
      productions.push(new Production(t.current, t.transitionLabel + t.next));
    });
    productions.push(new Production(FA.finalState, ''));

    return productions;
  }
}