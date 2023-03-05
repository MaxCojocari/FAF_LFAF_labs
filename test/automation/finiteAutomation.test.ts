import { FiniteAutomaton, Transition } from "../../src";

describe("FiniteAutomaton", () => {
  let FA: FiniteAutomaton;
  let Q = ['S', 'B', 'D', 'X'];
  let SIGMA = ['a', 'b', 'c'];
  let DELTA = [
    new Transition('S', 'a', 'B'),
    new Transition('S', 'b', 'B'),
    new Transition('B', 'b', 'D'),
    new Transition('D', 'b', 'X'),
    new Transition('D', 'a', 'D'),
    new Transition('B', 'c', 'B'),
    new Transition('B', 'a', 'S')
  ]
  let Q0 = 'S';
  let F = 'X';
  let trueSample = [
    'bcbb',
    'babbaaaaaaab',
    'abb',
    'bcaaabbb',
    'bbaaab',
    'bcababbb',
    'baabb',
    'acabbaab'
  ]
  let falseSample = [
    '',
    'bbberf',
    'babbabbbbbbcccc',
    'bccccabababaaaaaab',
    'a',
    'ac',
    'aaaaaaaa',
    'abccbb',
    'bcaab'
  ]

  it("construct finite automaton", () => {
    FA = new FiniteAutomaton(Q, SIGMA, DELTA, Q0, F);

    expect(FA.setOfStates).toEqual(Q);
    expect(FA.alphabet).toEqual(SIGMA);
    expect(FA.transitions).toEqual(DELTA);
    expect(FA.intialState).toEqual(Q0);
    expect(FA.finalState).toEqual(F);
  });

  it("should verify if string belongs to langauge", () => {
    for (let word of trueSample) {
      expect(FA.stringBelongToLanguage(word)).toEqual(true);
    }
    for (let word of falseSample) {
      expect(FA.stringBelongToLanguage(word)).toEqual(false);
    }
  });
});