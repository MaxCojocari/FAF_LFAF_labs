import {
  Grammar,
  GrammarChecker,
  Production
} from "../../src";

describe('GrammarChecker', () => {
  let productions: Production[];
  let G: Grammar[] = [];
  let Vn: string[];
  let Vt: string[];

  it("create grammar", () => {
    Vn = ['S', 'B', 'D'];
    Vt = ['a', 'b', 'c'];

    // 0. right-regular grammar
    productions = [
      new Production('S', 'aB'),
      new Production('S', 'bB'),
      new Production('B', 'bD'),
      new Production('D', 'b'),
      new Production('D', 'aD'),
      new Production('B', 'cB'),
      new Production('B', 'aS')
    ];
    G.push(new Grammar(Vn, Vt, productions, 'S'));

    // 1. left-regular grammar
    productions = [
      new Production('S', 'B'),
      new Production('S', 'Bb'),
      new Production('B', 'Db'),
      new Production('D', 'abc'),
      new Production('D', 'Daa')
    ];
    G.push(new Grammar(Vn, Vt, productions, 'S'));

    // 2. context-free grammar
    productions = [
      new Production('S', 'aBa'),
      new Production('B', 'bB'),
      new Production('B', 'bDacA'),
      new Production('D', 'BD'),
      new Production('D', 'a'),
    ];
    G.push(new Grammar(Vn, Vt, productions, 'S'));

    // 3. context-sensitive grammar
    productions = [
      new Production('S', 'aBa'),
      new Production('B', 'bB'),
      new Production('aB', 'bc'),
      new Production('D', 'BD'),
    ];
    G.push(new Grammar(Vn, Vt, productions, 'S'));

    // 4. phrase-structure grammar
    productions = [
      new Production('S', 'abcSaB'),
      new Production('B', 'bBa'),
      new Production('aBc', 'b'),
      new Production('B', ''),
      new Production('Dc', 'BD'),
    ];
    G.push(new Grammar(Vn, Vt, productions, 'S'));
  })

  it("isRightRegularGrammar", () => {
    expect(GrammarChecker.isRightRegularGrammar(G[0])).toEqual(true);
  });

  it("isLeftRegularGrammar", () => {
    expect(GrammarChecker.isLeftRegularGrammar(G[0])).toEqual(false);
    expect(GrammarChecker.isLeftRegularGrammar(G[1])).toEqual(true);
    expect(GrammarChecker.isLeftRegularGrammar(G[3])).toEqual(false);
  });

  it("isRegularGrammar", () => {
    expect(GrammarChecker.isRegularGrammar(G[0])).toEqual(true);
    expect(GrammarChecker.isRegularGrammar(G[1])).toEqual(true);
    expect(GrammarChecker.isRegularGrammar(G[4])).toEqual(false);
  });

  it("isContextFreeGrammar", () => {
    expect(GrammarChecker.isContextFreeGrammar(G[2])).toEqual(true);
    expect(GrammarChecker.isContextFreeGrammar(G[1])).toEqual(false);
    expect(GrammarChecker.isContextFreeGrammar(G[3])).toEqual(false);
  });

  it("isContextSensitiveGrammar", () => {
    expect(GrammarChecker.isContextSensitiveGrammar(G[3])).toEqual(true);
    expect(GrammarChecker.isContextSensitiveGrammar(G[1])).toEqual(false);
    expect(GrammarChecker.isContextSensitiveGrammar(G[4])).toEqual(false);
  });

  it("getGrammarType", () => {
    expect(GrammarChecker.getGrammarType(G[0])).toEqual("type 3");
    expect(GrammarChecker.getGrammarType(G[1])).toEqual("type 3");
    expect(GrammarChecker.getGrammarType(G[2])).toEqual("type 2");
    expect(GrammarChecker.getGrammarType(G[3])).toEqual("type 1");
    expect(GrammarChecker.getGrammarType(G[4])).toEqual("type 0");
  });
})