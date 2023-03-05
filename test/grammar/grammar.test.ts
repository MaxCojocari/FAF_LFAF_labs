import { Grammar, Production } from "../../src";

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
});
