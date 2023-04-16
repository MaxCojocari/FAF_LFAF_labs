import { Grammar, Production, InaccessibleSymbolRemover } from "../../../src";

describe("InaccessibleSymbolRemover", () => {
    let inaccessibleRemover: InaccessibleSymbolRemover = new InaccessibleSymbolRemover();
    let Vn: string[];
    let Vt: string[];
    let productions: Production[];
    let transitions: string[][];
    let G: Grammar;

    it("construct grammar", () => {
        Vt = ['a', 'b'];
        Vn = ['S', 'A', 'B', 'C', 'D', 'E'];
        productions = [];
        transitions = [
            ['S', 'AC'],
            ['A', 'a'],
            ['B', 'b'],
            ['C', 'Ea'],
            ['D', 'BC'],
            ['D', 'b'],
            ['E', 'b'],
        ]
        transitions.forEach(t => {
            productions.push(new Production(t[0], t[1]))
        });
        G = new Grammar(Vn, Vt, productions, 'S');
    });

    it("should return inaccessible symbols", () => {
        expect(inaccessibleRemover.getInaccessibleSymbols(G)).toEqual(['B', 'D']);
    });

    it("should remove corresponding symbol", () => {
        let ans = inaccessibleRemover.removeInaccessibleSymbol('X', ['a', 'b'], ['S', 'X', 'Y']);
        expect(ans).toEqual([['a', 'b'], ['S', 'Y']])

        ans = inaccessibleRemover.removeInaccessibleSymbol('a', ['a', 'b'], ['S', 'X', 'Y']);
        expect(ans).toEqual([['b'], ['S', 'X', 'Y']])
    });

    it("should remove useless producions", () => {
        expect(inaccessibleRemover.removeInaccessibleSymbols(G));
        let finalProductions = [
            new Production('S', 'AC'),
            new Production('A', 'a'),
            new Production('C', 'Ea'),
            new Production('E', 'b'),
        ]
        expect(G.productions).toEqual(finalProductions);
    });
});