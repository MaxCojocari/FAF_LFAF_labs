import { Token } from "./Token";

export class TokenStream {
  private cursor = 0;
  public tokens: Token[];

  constructor() {
    this.tokens = [];
  }

  public currentToken(moveCursor: boolean = false): Token {
    const token = this.tokens[this.cursor];

    if (moveCursor) {
      this.cursor++;
    }

    return token;
  }

  public hasNext(): boolean {
    return !!this.peekToken();
  }

  public nextToken(): Token {
    return this.tokens[++this.cursor];
  }

  public peekToken(): Token {
    return this.tokens[this.cursor + 1];
  }

  public pushToken(token: Token): void {
    this.tokens.push(token);
  }
}
