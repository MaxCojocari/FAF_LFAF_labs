import { CompressedTransition } from "./CompressedTransition";
import { FiniteAutomaton } from "./FiniteAutomaton";
import { NFAConvertor } from "./conversion/NFAConvertor";

export class DFA {
  readonly transitionTable: CompressedTransition[];

  constructor(FA: FiniteAutomaton) {
    this.transitionTable = DFA.getTransitionTable(FA);
  }

  // returns true if this is DFA, overwise false
  public static isDFA(FA: FiniteAutomaton): boolean {
    let transitionLabels: Map<string, string[]> = new Map<string, string[]>();

    for (let t of FA.transitions) {
      // if there is an ε-transition, it's not DFA
      if (!t.transitionLabel) return false;

      if (transitionLabels.has(t.current)) {
        let labels = transitionLabels.get(t.current);

        // if there are transitions with same init state and 
        // transition label, then it's not DFA
        if (labels?.includes(t.transitionLabel))
          return false;

        // else add new transition label
        else {
          labels?.push(t.transitionLabel);
        }

        // if no initial state was found, set a new pair
      } else {
        transitionLabels.set(t.current, [t.transitionLabel]);
      }
    }

    return true;
  }

  // returns true if finite automaton is NFA, overwise false
  public static isNFA(FA: FiniteAutomaton): boolean {
    return !this.isDFA(FA);
  }

  // returns transition table representation of DFA
  public static getTransitionTable(FA: FiniteAutomaton): CompressedTransition[] {
    let transitionTable: CompressedTransition[] = [];

    for (let state of FA.setOfStates) {
      transitionTable.push(new CompressedTransition([state]))
    }

    FA.transitions.forEach(transition => {
      transitionTable.forEach(state => {
        if (state.previous[0] === transition.current) {
          state.addTransitionPart(transition.transitionLabel, [transition.next])
        }
      })
    });

    return transitionTable;
  }

  // returns the string for graphviz representation of the graph
  public static getPlainGraph(FA: FiniteAutomaton): string {
    const transitionTable: CompressedTransition[] = NFAConvertor.toDFA(FA);

    let str: string = `digraph{`;
    transitionTable.forEach(start => {
      for (let [key, value] of start.final.entries()) {
        str += `"{`;
        for (let i = 0; i < start.previous.length; ++i) {
          if (i == 0) str += start.previous[i];
          else {
            str += ',' + start.previous[i];
          }
        }
        str += `}"->"{`;
        for (let j = 0; j < value.length; ++j) {
          if (j == 0) str += value[j];
          else {
            str += ',' + value[j];
          }
        }
        str += `}"[label=` + key + `]`;
      }
    });

    for (let t of transitionTable) {
      if (t.previous.includes(FA.finalState)) {
        for (let i = 0; i < t.previous.length; ++i) {
          if (i == 0) str += `"{` + t.previous[i];
          else str += ',' + t.previous[i]
        }
        str += `}"[shape=doublecircle]`
      }
    }
    str += `}`;
    return str;
  }
}

