import { FiniteAutomaton } from "../../automaton/FiniteAutomaton";
import { Transition } from "../../automaton/Transition";
import { Grammar } from "../Grammar";

export class GrammarToAutomatonConverter {
  public static toFiniteAutomaton(grammar: Grammar): FiniteAutomaton {
    // set of states
    let Q = [...grammar.nonTerminalSymbols].concat(['X']);

    // alphabet
    let sigma = grammar.terminalSymbols;

    // transition function
    let delta: Transition[] = this.getTransitionFunction(grammar);

    // initial state
    let q0 = 'S'

    // final state
    let F = 'X'

    return new FiniteAutomaton(Q, sigma, delta, q0, F);
  };

  public static getTransitionFunction(grammar: Grammar): Transition[] {
    let delta: Transition[] = [];
    grammar.productions.forEach(p => {
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

    return delta;
  }
}