import {
  Grammar,
  Production,
  Transition,
  GrammarToAutomatonConverter
} from "../../src";

describe("GrammarToAutomatonConverter", () => {
  let productions: Production[] = [];
  let G: Grammar;

  it('create new grammar', () => {
    productions.push(new Production('S', 'aB'));
    productions.push(new Production('S', 'bB'));
    productions.push(new Production('B', 'bD'));
    productions.push(new Production('D', 'b'));
    productions.push(new Production('D', 'aD'));
    productions.push(new Production('B', 'cB'));
    productions.push(new Production('B', 'aS'));
    let Vn = ['S', 'B', 'D'];
    let Vt = ['a', 'b', 'c'];
    G = new Grammar(Vn, Vt, productions, 'S');
  });

  it("should convert to finite automaton", () => {
    const FA = GrammarToAutomatonConverter.toFiniteAutomaton(G);

    const transitions = [
      new Transition('S', 'a', 'B'),
      new Transition('S', 'b', 'B'),
      new Transition('B', 'b', 'D'),
      new Transition('D', 'b', 'X'),
      new Transition('D', 'a', 'D'),
      new Transition('B', 'c', 'B'),
      new Transition('B', 'a', 'S')
    ]
    expect(FA.setOfStates).toEqual([...G.nonTerminalSymbols].concat(['X']));
    expect(FA.alphabet).toEqual(G.terminalSymbols);
    expect(FA.transitions).toEqual(transitions);
    expect(FA.intialState).toEqual('S');
    expect(FA.finalState).toEqual('X');
  });
});