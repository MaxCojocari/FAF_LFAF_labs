import { Grammar, Production, UnitProductionRemover } from "../../../src";

describe("UnitProductionRemover", () => {
    let unitRemover: UnitProductionRemover = new UnitProductionRemover();
    let Vn: string[];
    let Vt: string[];
    let productions: Production[];
    let transitions: string[][];
    let G: Grammar;

    it("construct grammar", () => {
        Vn = ['S', 'A', 'B', 'C', 'D', 'E'];
        productions = [];
        transitions = [
            ['S', 'ACD'],
            ['S', 'AD'],
            ['S', 'AC'],
            ['S', 'A'],
            ['A', 'a'],
            ['C', 'ED'],
            ['C', 'E'],
            ['D', 'BC'],
            ['D', 'b'],
            ['D', 'B'],
            ['D', 'C'],
            ['E', 'b'],
            ['B', 'a']
        ]
        transitions.forEach(t => {
            productions.push(new Production(t[0], t[1]))
        });
        G = new Grammar(Vn, Vt, productions, 'S');
    });

    it("should detect particular unit production", () => {
        expect(unitRemover.isUnitProduction(productions[0])).toBeFalsy;
        expect(unitRemover.isUnitProduction(productions[3])).toBeTruthy;
    });

    it("should get next unit production", () => {
        expect(unitRemover.getNextUnitProduction(productions)).toEqual([3, productions[3]]);
    });

    it("should check for unit productions", () => {
        expect(unitRemover.isThereUnitProduction(productions)).toBeTruthy;
    });


    it("unit productions should be eliminated", () => {
        unitRemover.removeUnitProductions(G);
        let finalProductions = [
            new Production('S', 'ACD'),
            new Production('S', 'AD'),
            new Production('S', 'AC'),
            new Production('A', 'a'),
            new Production('C', 'ED'),
            new Production('D', 'BC'),
            new Production('D', 'b'),
            new Production('E', 'b'),
            new Production('B', 'a'),
            new Production('S', 'a'),
            new Production('C', 'b'),
            new Production('D', 'a'),
            new Production('D', 'ED'),
            new Production('D', 'b')
        ]
        expect(G.productions).toEqual(finalProductions);
    });
});