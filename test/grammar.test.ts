import { Grammar, Transition } from "../src/index";
import { Production } from "../src/grammar/Production";

describe('Grammar', () => {
  let productions: Production[] = [];
  let T: Map<string, string[]>;
  let G: Grammar;

  it('adds new productions', () => {
    productions.push(new Production('S', 'aB'));
    productions.push(new Production('S', 'bB'));
    productions.push(new Production('B', 'bD'));
    productions.push(new Production('D', 'b'));
    productions.push(new Production('D', 'aD'));
    productions.push(new Production('B', 'cB'));
    productions.push(new Production('B', 'aS'));
  });

  it("create grammar", () => {
    let Vn = ['S', 'B', 'D'];
    let Vt = ['a', 'b', 'c'];
    G = new Grammar(Vn, Vt, productions, 'S');
    expect(G.nonTerminalSymbols).toEqual(Vn);
    expect(G.terminalSymbols).toEqual(Vt);
    expect(G.productions).toStrictEqual(productions);
    expect(G.startSymbol).toEqual('S');
  });

  it("contents of map are correct", () => {
    T = Grammar.genTransitionMap(productions);
    expect(G.transitionMap).toStrictEqual(T);
  });

  it("genWord", () => {
    let resultWords: string[] = []
    for (let i = 0; i < 5; ++i) {
      const newWord = G.genWord();
      if (!resultWords.includes(newWord)) resultWords.push(G.genWord());
    }
    console.log(resultWords);
  });

  it("toFiniteAutomaton", () => {
    const FA = G.toFiniteAutomaton();
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
