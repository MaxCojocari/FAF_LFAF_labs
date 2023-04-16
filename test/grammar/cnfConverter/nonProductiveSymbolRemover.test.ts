import { Grammar, Production, NonProductiveSymbolRemover } from "../../../src";

describe("NonProductiveSymbolRemover", () => {
    let inaccessibleRemover: NonProductiveSymbolRemover = new NonProductiveSymbolRemover();
    let Vn: string[];
    let Vt: string[];
    let productions: Production[] = [];
    let transitions: string[][];
    let G: Grammar;

    it("construct grammar", () => {
        Vt = ['a', 'b'];
        Vn = ['S', 'A', 'B', 'C', 'D', 'E'];
        transitions = [
            ['S', 'ACD'],
            ['A', 'a'],
            ['C', 'ED'],
            ['D', 'BC'],
            ['D', 'b'],
            ['E', 'b']
        ]
        transitions.forEach(t => {
            productions.push(new Production(t[0], t[1]))
        });
        G = new Grammar(Vn, Vt, productions, 'S');
    });

    it("should return set of productive symbols", () => {
        const ans = inaccessibleRemover.getProductiveSymbolsSet(G);
        expect(ans).toEqual(['A', 'C', 'D', 'E', 'S']);
    });

    it("should remove particular non productive symbol", () => {
        expect(
            inaccessibleRemover.removeNonProductiveSymbol(
                ['A', 'B', 'C'],
                'B',
                [
                    new Production('A', 'ab'),
                    new Production('A', 'aB'),
                    new Production('B', 'C')
                ]
            )
        ).toEqual([
            ['A', 'C'],
            [new Production('A', 'ab')]
        ]);
    });

    it("should remove useless productions", () => {
        expect(inaccessibleRemover.removeNonProductiveSymbols(G));
        let finalProductions = [
            new Production('S', 'ACD'),
            new Production('A', 'a'),
            new Production('C', 'ED'),
            new Production('D', 'b'),
            new Production('E', 'b')
        ]
        expect(G.nonTerminalSymbols).toEqual(['S', 'A', 'C', 'D', 'E']);
        expect(G.terminalSymbols).toEqual(['a', 'b']);
        expect(G.productions).toEqual(finalProductions);
    });
});