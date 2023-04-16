import { parseTokenDefinition, compileTokenDefinition } from "../../src/token/utils";
import { Lexer } from "../../src/lexer/Lexer";
import * as fs from 'fs';

describe('Lexer', () => {
  const tokens = fs.readFileSync("./tokens.txt", 'utf8');
  const program = fs.readFileSync("./inputExample.txt", 'utf8');

  it("Lexer test", () => {
    const tokenRules = parseTokenDefinition(tokens);
    const compiledTokenRules = compileTokenDefinition(tokenRules);
    const tokenStream = new Lexer(compiledTokenRules).tokenize(program);
    // console.log(tokenStream.tokens);
  })
})