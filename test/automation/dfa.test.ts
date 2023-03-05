import {
  Transition,
  FiniteAutomaton,
  DFA
} from "../../src/index";
const fs = require("fs");

describe("DFA", () => {
  let Q: string[];
  let SIGMA: string[];
  let DELTA: Transition[];
  let Q0: string;
  let F: string;
  let FA: FiniteAutomaton;
  let NFA: FiniteAutomaton;
  let anotherNFA: FiniteAutomaton;

  it("create new finite automaton", () => {
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

  it("should detect if DFA or NFA", () => {
    expect(DFA.isDFA(FA)).toEqual(false);
    expect(DFA.isNFA(FA)).toEqual(true);

    DELTA = [
      new Transition('q0', 'a', 'q1'),
      new Transition('q1', 'b', 'q0'),
      new Transition('q2', 'c', 'q0'),
      new Transition('q1', 'a', 'q3'),
      new Transition('q0', 'b', 'q2'),
      new Transition('q2', 'a', 'q3')
    ]
    NFA = new FiniteAutomaton(Q, SIGMA, DELTA, Q0, F);

    expect(DFA.isDFA(NFA)).toEqual(true);
    expect(DFA.isNFA(NFA)).toEqual(false);

    DELTA = [
      new Transition('q0', 'b', 'q0'),
      new Transition('q0', 'a', 'q1'),
      new Transition('q2', 'c', 'q0'),
      new Transition('q1', '', 'q3'),
      new Transition('q0', 'b', 'q2')
    ]
    anotherNFA = new FiniteAutomaton(Q, SIGMA, DELTA, Q0, F);
    expect(DFA.isDFA(anotherNFA)).toEqual(false);
    expect(DFA.isNFA(anotherNFA)).toEqual(true);
  });

  it("should convert NFA to DFA", () => {
    Q = ["q0", "q1", "q2", "q3", 'q4'];
    SIGMA = ['a', 'b'];
    DELTA = [
      new Transition('q0', 'a', 'q1'),
      new Transition('q1', 'a', 'q1'),
      new Transition('q1', 'a', 'q2'),
      new Transition('q2', 'a', 'q3'),
      new Transition('q2', 'b', 'q2'),
      new Transition('q3', 'b', 'q0'),
      new Transition('q3', 'b', 'q3'),
      new Transition('q3', 'b', 'q4'),
      new Transition('q4', 'a', 'q0')
    ]
    anotherNFA = new FiniteAutomaton(Q, SIGMA, DELTA, Q0, F);
  });

  it("should draw DFA", () => {
    const str = DFA.getPlainGraph(FA);
    expect(str).toEqual(`digraph{"{q0}"->"{q1}"[label=a]"{q0}"->"{q2}"[label=b]"{q1}"->"{q2}"[label=b]"{q1}"->"{q3}"[label=a]"{q2}"->"{q0,q3}"[label=c]"{q0,q3}"->"{q1}"[label=a]"{q0,q3}"->"{q2}"[label=b]"{q3}"[shape=doublecircle]"{q0,q3}"[shape=doublecircle]}`)
    fs.writeFile("./plainGraph.txt", str, (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
});