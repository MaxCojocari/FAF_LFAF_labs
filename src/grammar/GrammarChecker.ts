import { Grammar } from "./Grammar";

export class GrammarChecker {

  public static isRegularGrammar(grammar: Grammar): boolean {
    if (this.isRightRegularGrammar(grammar) || this.isLeftRegularGrammar(grammar))
      return true;
    return false;
  }

  public static isRightRegularGrammar(grammar: Grammar): boolean {
    for (let production of grammar.productions) {
      let firstUpperCaseOccurance = production.right.search(/[A-Z]/);
      if (
        production.left.length != 1 ||
        !(
          firstUpperCaseOccurance == production.right.length - 1 ||
          (production.right.length >= 0 && firstUpperCaseOccurance == -1)
        )
      ) return false;
    };
    return true;
  }

  public static isLeftRegularGrammar(grammar: Grammar): boolean {
    for (let production of grammar.productions) {
      let firstUpperCaseOccurance = production.right.search(/[A-Z]/);
      if (
        production.left.length != 1 ||
        !(firstUpperCaseOccurance == 0 || (production.right.length >= 0 && firstUpperCaseOccurance == -1))
      ) return false;
    };
    return true;
  }

  public static isContextFreeGrammar(grammar: Grammar): boolean {
    const isRegular = this.isRegularGrammar(grammar);
    if (isRegular) return false;
    for (let production of grammar.productions) {
      if (production.left.length > 1 && !isRegular) return false;
    }
    return true;
  }

  public static isContextSensitiveGrammar(grammar: Grammar): boolean {
    const isRegular = this.isRegularGrammar(grammar);
    const isContextFree = this.isContextFreeGrammar(grammar);
    if (isContextFree || isRegular) return false;

    for (let production of grammar.productions) {
      if (
        (
          production.right.length == 0 ||
          production.left.length > production.right.length
        ) && !isContextFree
      ) return false;
    }
    return true;
  }

  public static getGrammarType(grammar: Grammar): string {
    if (this.isRegularGrammar(grammar)) return "type 3";
    else if (this.isContextFreeGrammar(grammar)) return "type 2";
    else if (this.isContextSensitiveGrammar(grammar)) return "type 1";
    else return "type 0";
  }
}