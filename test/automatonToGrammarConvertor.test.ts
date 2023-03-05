import {
  Transition,
  FiniteAutomaton,
  Production,
  AutomatonToGrammarConvertor
} from "../src";

describe("AutomatonToGrammarConvertor", () => {
  let Q: string[];
  let SIGMA: string[];
  let DELTA: Transition[];
  let Q0: string, F: string, FA: FiniteAutomaton;

  it("create new finite automaton", () => {
    Q = ["q0", "q1", "q2", "q3"];
    SIGMA = ['a', 'b', 'c'];
    DELTA = [
      new Transition('q0', 'a', 'q1'),
      new Transition('q1', 'b', 'q2'),
      new Transition('q2', 'c', 'q0'),
      new Transition('q1', 'a', 'q3'),
      new Transition('q0', 'b', 'q2'),
      new Transition('q2', 'c', 'q3')
    ]
    Q0 = 'q0';
    F = 'q3';
    FA = new FiniteAutomaton(Q, SIGMA, DELTA, Q0, F);
  });

  it("should convert back to regular grammar", () => {
    const newGrammar = AutomatonToGrammarConvertor.toRegularGrammar(FA);
    expect(newGrammar.startSymbol).toEqual('q0');
    expect(newGrammar.terminalSymbols).toEqual(['a', 'b', 'c']);
    expect(newGrammar.nonTerminalSymbols).toEqual(["q0", "q1", "q2", "q3"]);

    let P = [
      new Production('q0', 'aq1'),
      new Production('q1', 'bq2'),
      new Production('q2', 'cq0'),
      new Production('q1', 'aq3'),
      new Production('q0', 'bq2'),
      new Production('q2', 'cq3'),
      new Production('q3', '')
    ]
    expect(newGrammar.productions).toEqual(P);
  });
});