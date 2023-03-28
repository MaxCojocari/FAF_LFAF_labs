import { parseTokensDef, compileTokensDef } from "../../src/utils";
import { Lexer } from "../../src/lexer/Lexer";
import * as fs from 'fs';

describe('Lexer', () => {
  const tokens = fs.readFileSync("./tokens.txt", 'utf8');
  const program = fs.readFileSync("./test/inputExample.txt", 'utf8');

  it("Lexer test", () => {
    const tokenDef = parseTokensDef(tokens);
    const compiledTokenDef = compileTokensDef(tokenDef);
    const tokenStream = new Lexer(compiledTokenDef).tokenize(program);
    console.log("Input: \n", program);

    console.log("Tokens: \n", tokenStream.tokens)
  })
})