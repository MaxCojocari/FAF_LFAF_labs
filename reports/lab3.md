# Laboratory work nr.3

### Course: Formal Languages & Finite Automata
### Author: Maxim Cojocari-Goncear

----

## Theory

A lexer, short for lexical analyzer, is a program that takes in a sequence of characters as input and generates a sequence of tokens as output. Tokens are meaningful units of text, such as keywords, identifiers, operators, and punctuation, that are used in a programming language or other formal language.

The lexer's job is to recognize these tokens by analyzing the input text and matching it against a set of predefined patterns or regular expressions. 

Lexing is separated into two stages: scanning, which divides the input text into syntactic units called lexemes and classifies them into token classes, and evaluating, which translates lexemes into processed values. In the context of a lexer can be found another term *lexeme*. The *token* and *lexeme* meanings is slightly different, although they are used interchangeably in compiler design. Formaly, the lexeme is just the result of splitting based on delimiters, such as spaces, but the tokens give each lexeme a name or category.

The lexer is an essential component of any compiler or interpreter that translates source code into executable code or performs some other analysis or transformation on the input text.

## Objectives

1. Understanding the process of lexical analysis;
2. Getting familiar with the principles of work of a lexer/scanner/tokenizer;
3. Implementing a sample lexer and demonstrating its features.

## Implementation description

To start with, the working process of the lexer which I implemented can be resumed in 5 steps:

1. Parsing token rules defined by the user, splitting them in pairs `token type - extended regular expression`;
2. Converting extended regular expresssion definition into a regular expression which is readable by the host language;
3. Input preprocessing, including string trimming, removal of whitespaces, new line characters, etc;
4. Tokenization and token classification, by filtering string buffer through series of regular expressions specific to particular token type;
5. Generation/output of the token stream.

The syntax of input programms which are used in this example is very simmilar to JS/TS, but in a very primitive format.

*Input*

```
for (let i = 0; i < 10; ++i) {
    console.log("This is digit ", i);
}
```

*Output*

```
[
    Token { type: 'KEYWORD', value: 'for' },
    Token { type: 'SEPARATOR', value: '(' },
    Token { type: 'KEYWORD', value: 'let' },
    Token { type: 'IDENTIFIER', value: 'i' },
    Token { type: 'OPERATOR', value: '=' },
    Token { type: 'INTLITERAL', value: '0' },
    Token { type: 'SEPARATOR', value: ';' },
    Token { type: 'IDENTIFIER', value: 'i' },
    Token { type: 'OPERATOR', value: '<' },
    Token { type: 'INTLITERAL', value: '10' },
    Token { type: 'SEPARATOR', value: ';' },
    Token { type: 'OPERATOR', value: '+' },
    Token { type: 'OPERATOR', value: '+' },
    Token { type: 'IDENTIFIER', value: 'i' },
    Token { type: 'SEPARATOR', value: ')' },
    Token { type: 'SEPARATOR', value: '{' },
    Token { type: 'IDENTIFIER', value: 'console' },
    Token { type: 'SEPARATOR', value: '.' },
    Token { type: 'IDENTIFIER', value: 'log' },
    Token { type: 'SEPARATOR', value: '(' },
    Token { type: 'STRINGLITERAL', value: '"This is digit "' },
    Token { type: 'SEPARATOR', value: ',' },
    Token { type: 'IDENTIFIER', value: 'i' },
    Token { type: 'SEPARATOR', value: ')' },
    Token { type: 'SEPARATOR', value: ';' },
    Token { type: 'SEPARATOR', value: '}' }
]
```

### Step 1

In my implementation of lexer, first of all I defined the token rules (token grammar) on which will rely the input programs. It can be found in `./tokens.txt`. They are shown as key - value pairs where the key is the name of token e.g `STRINGLITERAL` or `OPERATOR`, and the value is either regex or a set of one or more literals. For example,

- `"any" | "number" | "string"` would capture tokens matching those strings precisely

- `0 | [1-9][0-9]*` would capture tokens for which the regular expression matches, e.g integer literals like `0`, `9` or `17`.


The scanning process of lexer starts by parsing the tokens' definition from `./token.txt` file. Using the helper function `parseTokenDefinition` from `./src/utils.ts`, all `key:value` pairs are separed into array of pairs which define each token part separately. Till this moment we prepare keys and extended regex strings in suitable parse format for the next step.

```
export function parseTokenDefinition(tokenDefInput: string): RawTokenDefinition {
  const parsedTokenDef: RawTokenDefinition = [];

  let index = -1;
  let currentNode: string | undefined;
  let state: State = State.Parsing;
  let prevState: State | undefined;

  let buffer: string[] = [];

  while (index++ < tokenDefInput.length) {
    const char = tokenDefInput.charAt(index);
    buffer.push(char);

    if (state === State.String && char !== '"') {
      continue;
    }

    if (char === '"') {
      if (tokenDefInput.charAt(index - 1) !== "\\") {
        if (state === State.String) {
          state = prevState || State.Parsing;
        } else {
          state = State.String;
        }
      }
    }
    ...
  }
  ...
}
```

Output:
```
  [
    [ 'STRINGLITERAL', `'[^']*' | \\"[^\\"]*\\"` ],
    [ 'DECIMALLITERAL', '[0-9]*\\.[0-9]+' ],
    [ 'INTLITERAL', '0 | [1-9][0-9]*' ],
    [ 'OCTALLITERAL', '0[0-9]+' ],
    [ 'TYPE', '"any" | "number" | "string" | "object"' ],
    [ 'BOOLEAN', '"true" | "false"' ],
    [
      'KEYWORD',
      '"if" | "else" |  "for" | "while" |  "const" | "let" | "var" |  "new" | "class" | "function" |  "number" | "object" | "boolean" | "string"'
    ],
    [
      'OPERATOR',
      '"|" | "!" | "=" | "*" | "-" | "+" | "=>" |  "+=" | "-=" |  "<" | ">" | ">=" | "<=" |  "&&" | "||" | "?" | "??" |  ":" | "@"'
    ],
    [
      'SEPARATOR',
      '";" | "," | "." | "?." | "(" | ")" | "{" | "}" | "[" | "]"'
    ],
    [ 'IDENTIFIER', '[a-zA-Z_\\$][a-zA-Z0-9]*' ]
  ]
```

### Step 2

The next step is processing the token extended regex definitions into regex formats acceptable by hosting language. This process is sufficiently implemented in another helper method `compileTokenDefinition` from `./src/utils.ts`. All regex complex transformations are done using `processRule` in the same directory.

```
export function compileTokenDefinition(tokenGrammar: RawTokenDefinition): CompiledTokenDefinition {
  const compiledTokenDef: CompiledTokenDefinition = [];

  for (let [ruleName, rawRule] of tokenGrammar) {
    compiledTokenDef.push([ruleName, processRule(rawRule)]);
  }

  return compiledTokenDef;
}
```

The processed token rules after this step should look like following:

```
[
    [ 'STRINGLITERAL', /^('[^']*'|"[^"]*")/ ],
    [ 'DECIMALLITERAL', /^([0-9]*\.[0-9]+)/ ],
    [ 'INTLITERAL', /^(0|[1-9][0-9]*)/ ],
    [ 'OCTALLITERAL', /^(0[0-9]+)/ ],
    [ 'TYPE', /^(any|number|string|object)/ ],
    [ 'BOOLEAN', /^(true|false)/ ],
    [
      'KEYWORD',
      /^(if|else|for|while|const|let|var|new|class|function|number|object|boolean|string)/
    ],
    [
      'OPERATOR',
      /^(\||!|=|\*|-|\+|=>|\+=|-=|<|>|>=|<=|&&|\|\||\?|\?\?|:|@)/
    ],
    [ 'SEPARATOR', /^(;|,|\.|\?\.|\(|\)|{|}|\[|\])/ ],
    [ 'IDENTIFIER', /^([a-zA-Z_\$][a-zA-Z0-9]*)/ ]
]
```

### Step 3

Steps 3, 4 and 5 are done in the main method `tokenize` from `Lexer` class located in `./src/lexer/Lexer.ts` directory. Here we only remove white spacess from the beginning and end of the string and `\n` characters.

```
let programBuffer = program.replace("\n", "").trim();
```

### Step 4

The tokenization and token classification is done by using preprocessed regular expression definitions from Step 2. The input token is filtered through all token rules (`this.tokenRules`) and the matched lexeme is isolated and converted into `Token` type. This process is repeated until input string is not finaly consumed. If an unknown token is found, the corresponding error message will be thrown. The freshly created token is put in `TokenStream` object which contains basic methods for data stream handling.

```
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
```
Both `Token` and `TokenStream` classes are located in `./src/token` directory.

### Step 5

The output token stream can be viewed by accessing `tokens` field from object of `TokenStream` type. The input programm can be adjusted or fully modified in `inputExample.txt` in the root of the project.

```
describe('Lexer', () => {
  const tokens = fs.readFileSync("./tokens.txt", 'utf8');
  const program = fs.readFileSync("./inputExample.txt", 'utf8');

  it("Lexer test", () => {
    const tokenRules = parseTokenDefinition(tokens);
    const compiledTokenRules = compileTokenDefinition(tokenRules);
    const tokenStream = new Lexer(compiledTokenRules).tokenize(program);
    console.log(tokenStream.tokens);
  })
})
```

The output in this case is shown at the beginning of this chapter. For observing the output, run `yarn test test/lexer/lexer.test.ts`.
After this step, these tokens can be passed to another entity for next processing operations.

## Further improvements

The big advantage of this implementation is that token definitions are customizable, regular expression definitions can be extended if user wish. As improvement goal can be extending the possible token spectra with new types and rules. The current implementation uses regular expressions to match characters. Using regular expressions can make the code shorter and more readable, but it can also be slower than using simple character comparison. In performance-critical applications, it may be necessary to optimize the lexer using other techniques. Furthermore, this implementation only recognizes ASCII letters. It will be great to support Unicode characters, for this the lexer would need to use a more sophisticated regular expression or a library that supports Unicode.

## Conclusions

The design and implementation of a lexer is an important step in building a compiler or interpreter for a programming language. Through this laboratory work, I have gained a deep understanding of the various components of a lexer, including tokenization, regular expressions, symbol tables, and error handling. I have also learned about the importance of designing a lexer that is flexible, efficient, and easy to maintain. By carefully considering the requirements of the language and the needs of the compiler or interpreter, we can create a lexer that is tailored to the specific use case.

To summarize, this laboratory work has provided me with a solid foundation for further study and exploration of compiler and interpreter design. With this knowledge, I can continue to develop my skills in building software systems that translate human-readable code into machine-executable instructions.

