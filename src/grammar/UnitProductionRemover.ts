import { Grammar } from "./Grammar";
import { Production } from "./Production";

export class UnitProductionRemover {
    public removeUnitProductions(grammar: Grammar) {
        let productions: Production[] = grammar.productions;

        while (this.isThereUnitProduction(productions)) {
            // find unit production
            const [indexToRemove, production] = this.getNextUnitProduction(productions);

            // remove unit production found
            productions =
                [
                    ...productions.slice(0, indexToRemove),
                    ...productions.slice(indexToRemove + 1)
                ]

            const transitionMap = Grammar.genTransitionMap(productions);
            const newRhs = transitionMap.get(production?.right as string)

            newRhs?.forEach(rhs => {
                productions.push(new Production(production?.left as string, rhs));
            });
        }

        grammar.setProductions(productions);
    }

    public getNextUnitProduction(productions: Production[]): [number, Production | null] {
        for (let i = 0; i < productions.length; ++i) {
            if (this.isUnitProduction(productions[i])) return [i, productions[i]];
        }
        return [productions.length, null];
    }

    public isThereUnitProduction(productions: Production[]): boolean {
        for (let p of productions) {
            if (this.isUnitProduction(p)) return true;
        }
        return false;
    }

    public isUnitProduction(production: Production): boolean {
        return production.right.length == 1 && /[A-Z]/.test(production.right);
    }
}