import { CompiledTokenDefinition } from "../token/utils";
import { Token } from "../token/Token";
import { TokenStream } from "../token/TokenStream";

function maximumMatch(matches: Record<string, RegExpMatchArray | null>) {
  let t: { matchToken: string; matchLength: number } | undefined;

  for (let matchToken in matches) {
    const match = matches[matchToken];
    if (!match) continue;
    const matchLength = match[0].length;

    if ((t && matchLength > t.matchLength) || (!t && matchLength > 0)) {
      t = { matchToken, matchLength };
    }
  }

  return t;
}

export class Lexer {
  private tokenRules: CompiledTokenDefinition;

  constructor(tokenRules: CompiledTokenDefinition) {
    this.tokenRules = tokenRules;
  }

  public tokenize(program: string): TokenStream {
    const tokenStream = new TokenStream();

    let programBuffer = program.replace("\n", "").trim();
    let currentOffset = 0;

    while (programBuffer) {
      const matches: Record<string, RegExpMatchArray | null> = {};

      for (let [tokenName, matcher] of this.tokenRules) {
        matches[tokenName] = programBuffer.match(matcher);
      }

      const match = maximumMatch(matches);

      if (!match) {
        throw new Error(
          `unexpected token ${programBuffer[0]} at offset ${currentOffset}`
        );
      }

      tokenStream.pushToken(
        new Token(
          match.matchToken,
          programBuffer.substring(0, match.matchLength)
        )
      );

      programBuffer = programBuffer.substring(match.matchLength).replace("\n", "").trim();
      currentOffset += match.matchLength;
    }

    return tokenStream;
  }
}
