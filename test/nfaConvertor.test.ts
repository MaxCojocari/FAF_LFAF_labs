import {
  CompressedTransition,
  DFA,
  FiniteAutomaton,
  NFAConvertor,
  Transition
} from "../src";

describe("NFAConvertor", () => {
  let Q: string[];
  let SIGMA: string[];
  let DELTA: Transition[];
  let Q0: string;
  let F: string;
  let FA: FiniteAutomaton;
  let newDFA: FiniteAutomaton;

  it("create NFA", () => {
    Q = ["q0", "q1", "q2", "q3"];
    SIGMA = ['a', 'b', 'c'];
    DELTA = [
      new Transition('q2', 'c', 'q0'),
      new Transition('q1', 'b', 'q2'),
      new Transition('q0', 'a', 'q1'),
      new Transition('q2', 'c', 'q3'),
      new Transition('q1', 'a', 'q3'),
      new Transition('q0', 'b', 'q2')
    ]
    Q0 = 'q0';
    F = 'q3';
    FA = new FiniteAutomaton(Q, SIGMA, DELTA, Q0, F);
  });

  it("should do nothing if NFA is already DFA", () => {
    DELTA = [
      new Transition('q0', 'a', 'q1'),
      new Transition('q1', 'b', 'q0'),
      new Transition('q2', 'c', 'q0'),
      new Transition('q1', 'a', 'q3'),
      new Transition('q0', 'b', 'q2'),
      new Transition('q2', 'a', 'q3')
    ]
    newDFA = new FiniteAutomaton(Q, SIGMA, DELTA, Q0, F);
    expect(DFA.getTransitionTable(newDFA)).toEqual(NFAConvertor.toDFA(newDFA));
  });

  it("should convert to DFA", () => {
    const transitionTable = NFAConvertor.toDFA(FA);

    // check row by row
    expect(transitionTable[0]).toEqual(
      new CompressedTransition(['q0'])
        .addTransitionPart('a', ['q1'])
        .addTransitionPart('b', ['q2'])
    );

    expect(transitionTable[1]).toEqual(
      new CompressedTransition(['q1'])
        .addTransitionPart('b', ['q2'])
        .addTransitionPart('a', ['q3'])
    );

    expect(transitionTable[2]).toEqual(
      new CompressedTransition(['q2'])
        .addTransitionPart('c', ['q0', 'q3'])
    );

    expect(transitionTable[3]).toEqual(
      new CompressedTransition(['q3'])
    );

    expect(transitionTable[4]).toEqual(
      new CompressedTransition(['q0', 'q3'])
        .addTransitionPart('a', ['q1'])
        .addTransitionPart('b', ['q2'])
    );

  });
});