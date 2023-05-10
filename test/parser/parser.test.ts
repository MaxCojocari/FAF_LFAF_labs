import { Lexer } from "../../src/lexer/Lexer";
import * as fs from 'fs';
import { parseTokenDefinition, compileTokenDefinition } from "../../src/token/utils";
import { Grammar, Parser, Production, TokenStream } from "../../src/index"
import { grammar } from "../../arithmeticGrammar";

const getTokenStream = (input: string): TokenStream => {
  const tokenDef = fs.readFileSync("./tokens.txt", 'utf8');
  const tokenRules = parseTokenDefinition(tokenDef);
  const compiledTokenRules = compileTokenDefinition(tokenRules);
  const tokenStream = new Lexer(compiledTokenRules).tokenize(input);
  return tokenStream;
}

const getGrammar = (
  Vn: string[],
  Vt: string[],
  transitions: string[][],
  startSymbol: string
): Grammar => {
  let productions: Production[] = [];
  transitions.forEach(t => {
    productions.push(new Production(t[0], t[1]))
  });

  return new Grammar(Vn, Vt, productions, startSymbol);
}

describe('Parser', () => {
  let transitions: string[][];
  let parser: Parser;
  let Vn: string[];
  let Vt: string[];
  let G1: Grammar;
  let G2: Grammar;

  it("construct sample grammars", () => {
    Vn = ['S', 'L'];
    Vt = ['(', ')', 'a', ','];
    transitions = [
      ['S', '(L)'],
      ['S', 'a'],
      ['L', 'L,S'],
      ['L', 'S']
    ];
    G1 = getGrammar(Vn, Vt, transitions, 'S');
    G2 = getGrammar(grammar.nonTerminals, grammar.terminals, grammar.productions, grammar.startSymbol);
  });


  it("Parser test, first grammar", () => {
    const inputSamples = [
      { input: "(a, (  a,a))", accepted: true },
      { input: "(((a, ((((a),a), ((a,((a),a,a,(a))))),a,a,a))   ),a)", accepted: true },
      { input: "(a,(((a,(a,(a))),a,(a)),((a),a),a,a,(a)))", accepted: true },
      { input: "((((a)),(((a,((a,a)))))))", accepted: true },
      { input: "(a,  a,(  a)))", accepted: false },
      { input: "((((a),b)))", accepted: false }
    ];

    parser = new Parser(G1);

    inputSamples.forEach(sample => {
      const tokenStream = getTokenStream(sample.input);
      const res = parser.parse(tokenStream);
      expect(res.accepted).toEqual(sample.accepted);
    });
  });

  it("Parser test, second grammar", () => {
    const inputSamples = [
      { input: "d", accepted: true },
      { input: "((( d)) + 1)   +9", accepted: true },
      { input: "1 + 1", accepted: true },
      { input: "(b+D)/(2*a*b)", accepted: true },
      { input: "(a+2)*((1-0/z))*(a+b*(8)*((a*(x+y+z))))", accepted: true },
      { input: "(x+2)((1-0/*z))(a+b*((a*(x+y+z))))", accepted: false },
      { input: "((1-0/z))*(a+b*((a*(x+y+z)))", accepted: false },
      { input: "+(a+1)-x/y", accepted: false },
      { input: "()", accepted: false },
      { input: "+a--", accepted: false }
    ];

    parser = new Parser(G2);

    inputSamples.forEach(sample => {
      const tokenStream = getTokenStream(sample.input);
      const res = parser.parse(tokenStream);
      expect(res.accepted).toEqual(sample.accepted);
    });
  });

  it("Abstract Syntax Tree", () => {
    let input = "(a+b)/2";
    const tokenStream = getTokenStream(input);
    const str = JSON.stringify(parser.parse(tokenStream).AST);
    fs.writeFile("./ASToutput.json", str, (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
})