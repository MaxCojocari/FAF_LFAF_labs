
import { Grammar, LambdaProductionRemover, Production } from "../../../src";

describe("LambdaProductionRemover", () => {
    let lambdaRemover: LambdaProductionRemover = new LambdaProductionRemover();
    let Vn: string[];
    let Vt: string[];
    let productions: Production[];
    let transitions: string[][];
    let G: Grammar;

    it("construct grammar", () => {
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
        G = new Grammar(Vn, Vt, productions, 'S');
    });

    it("should detect if particular production is lambda production or not", () => {
        expect(lambdaRemover.isLambdaProduction(new Production('X', ''))).toBeTruthy;
        expect(lambdaRemover.isLambdaProduction(new Production('B', 'abc'))).toBeTruthy;
    });

    it("should find if there are lambda productions in grammar", () => {
        productions = [new Production('S', 'abB'), new Production('A', '')];
        expect(lambdaRemover.isThereLambdaProduction(productions)).toBeTruthy;
        productions = [new Production('S', 'a'), new Production('B', 'aD')];
        expect(lambdaRemover.isThereLambdaProduction(productions)).toBeFalsy;
    });

    it("should get next lambda production", () => {
        productions = [
            new Production('S', 'A'),
            new Production('A', 'bSAA'),
            new Production('A', ''),
            new Production('A', 'S')
        ]
        expect(lambdaRemover.getNextLambdaProduction(productions)).toEqual([2, productions[2]]);
    });

    it("should substitute all possible RHS combinations", () => {
        let targetProduction = productions[1];
        let lambdaProduction = productions[2];
        lambdaRemover.substituteAllLambdaCombinations(targetProduction, lambdaProduction, productions);

        let finalProductions = [
            new Production('S', 'A'),
            new Production('A', 'bSAA'),
            new Production('A', ''),
            new Production('A', 'S'),
            new Production('A', 'bSA'),
            new Production('A', 'bS')
        ]

        expect(productions).toEqual(finalProductions);
    });

    it("should eliminate all lambda productions", () => {
        lambdaRemover.removeLambdaProductions(G);
        let finalProductions = [
            new Production('S', 'bA'),
            new Production('S', 'AC'),
            new Production('A', 'bS'),
            new Production('A', 'BC'),
            new Production('A', 'AbAa'),
            new Production('B', 'BbaA'),
            new Production('B', 'a'),
            new Production('B', 'bSa'),
            new Production('D', 'AB'),
            new Production('S', 'A'),
            new Production('A', 'B')
        ]
        expect(G.productions).toEqual(finalProductions);
    });
});