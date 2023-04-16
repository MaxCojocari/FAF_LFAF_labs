import { CNFConverter, Grammar, Production } from "../../../src";

describe("CNFConverter", () => {
    let Vn: string[];
    let Vt: string[];
    let productions: Production[];
    let transitions: string[][];
    let G1: Grammar;
    let G2: Grammar;
    let converter: CNFConverter = new CNFConverter();

    it("construct first grammar", () => {
        Vt = ['a', 'b'];
        Vn = ['S', 'A', 'B'];
        productions = [];
        transitions = [
            ['S', 'aB'],
            ['S', 'a'],
            ['B', 'aS'],
            ['A', 'aA'],
            ['A', 'S']
        ]
        transitions.forEach(t => {
            productions.push(new Production(t[0], t[1]))
        });
        G1 = new Grammar(Vn, Vt, productions, 'S');
    });

    it("construct second grammar", () => {
        Vt = ['a', 'b'];
        Vn = ['S', 'A', 'B', 'C', 'D'];
        productions = [];
        transitions = [
            ['S', 'bA'],
            ['S', 'AC'],
            ['A', 'bS'],
            ['A', 'BC'],
            ['A', 'AbAa'],
            ['B', 'BbaA'],
            ['B', 'a'],
            ['B', 'bSa'],
            ['C', ''],
            ['D', 'AB']
        ]
        transitions.forEach(t => {
            productions.push(new Production(t[0], t[1]))
        });
        G2 = new Grammar(Vn, Vt, productions, 'S');
    });


    it("should prepare grammar for normalisation", () => {
        expect(converter.prepareGrammarForCFN(G1));

        let finalProductions = [
            new Production('S', 'aB'),
            new Production('S', 'a'),
            new Production('B', 'aS')
        ]

        expect(G1.nonTerminalSymbols).toEqual(['S', 'B']);
        expect(G1.terminalSymbols).toEqual(['a']);
        expect(G1.productions).toEqual(finalProductions);
    });

    it("should rewrite in proper CNF", () => {
        expect(converter.convertToCNF(G1));

        let finalProductions = [
            new Production('S0', 'CB'),
            new Production('S0', 'a'),
            new Production('S', 'CB'),
            new Production('S', 'a'),
            new Production('B', 'CS'),
            new Production('C', 'a')
        ]

        expect(G1.nonTerminalSymbols).toEqual(['S0', 'S', 'B', 'C']);
        expect(G1.terminalSymbols).toEqual(['a']);
        expect(G1.productions).toEqual(finalProductions);
    });

    it("should rewrite in proper CNF, second case", () => {
        expect(converter.convertToCNF(G2));
        // console.log(G2);

        let finalProductions = [
            ['S0', 'CA'],
            ['S0', 'CS'],
            ['S0', 'AD'],
            ['S0', 'BE'],
            ['S0', 'a'],
            ['S0', 'CF'],
            ['S', 'CA'],
            ['S', 'CS'],
            ['S', 'AD'],
            ['S', 'BE'],
            ['S', 'a'],
            ['S', 'CF'],
            ['A', 'CS'],
            ['A', 'AD'],
            ['A', 'BE'],
            ['A', 'a'],
            ['A', 'CF'],
            ['B', 'BE'],
            ['B', 'a'],
            ['B', 'CF'],
            ['C', 'b'],
            ['D', 'CG'],
            ['E', 'CH'],
            ['F', 'SI'],
            ['G', 'AI'],
            ['H', 'IA'],
            ['I', 'a']
        ]

        expect(G2.nonTerminalSymbols).toEqual([
            'S0', 'S', 'A', 'B',
            'C', 'D', 'E', 'F',
            'G', 'H', 'I'
        ]);
        expect(G2.terminalSymbols).toEqual(['a', 'b']);

        finalProductions.forEach(p => {
            productions.push(new Production(p[0], p[1]))
        });
        for (let i = 0; i < G2.productions.length; ++i) {
            expect(G2.productions[i]).toEqual(new Production(finalProductions[i][0], finalProductions[i][1]))
        }

        expect(G2.startSymbol).toEqual('S0');
    });
});