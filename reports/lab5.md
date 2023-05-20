# Laboratory work nr.5

### Course: Formal Languages & Finite Automata
### Author: Maxim Cojocari-Goncear

----

## Theory

A parser is a software component or algorithm that analyzes the structure of a text or input and determines its grammatical structure based on a set of predefined rules. In the context of compiler design, a parser is a crucial component that analyzes the syntax of a programming language and determines if the input program adheres to the grammar rules defined by the language.

The primary goal of a parser is to transform a stream of tokens (lexical analysis output) into a hierarchical structure that represents the syntactic structure of the program. This hierarchical structure is often represented as an abstract syntax tree (AST) or a parse tree.

Parsers can be categorized into two main types:

1. Top-down parsers
2. Bottom-up parsers 

## Objectives

1. Learning about parsing, what it is and how it can be programmed;
2. Getting familiar with the concept of AST;
3. Implementting an AST and the necessary data structures for it;
4. Implementing a simple parser program that could extract the syntactic information from the input text.

## Implementation description

In this laboratory work was implemented a **shift-reduce** parser. It is a type of bottom-up parser commonly used in compiler design and syntax analysis. It belongs to the class of LR parsers, which are powerful and efficient for handling a broad range of programming languages [1][2].

The implementation of the parser is located in the `Parser` class, which resides in the `./src/parser/Parser.ts` directory. The core functionality of the parser is encapsulated within the `parse` method. When invoked, this method takes the token stream as input and performs the parsing process. All grammar rules are preset in the `Parser` class constructor.

```
public parse(tokenStream: TokenStream): ParserResponse {
    this.buffer = tokenStream.getTokens();
    this.stack = [new Token("STACK_MARKER", '$')];
    const startSymbol = this.grammar.startSymbol;

    while (this.buffer.length > 0) {
        this.shift();
        this.findMatchAndReduce();
    }

    // stop condition ('accepting' the input)
    if (this.stack.length == 2 && this.stack[1].value === startSymbol) {
        return { accepted: true, AST: this.ASTNodeStack.pop() };
    }

    // otherwise 'reject'
    return { accepted: false, AST: undefined };
}
```

The shift-reduce parsing algorithm proceeds by repeatedly performing *shift* and *reduce* actions until it reaches the end of the input and successfully constructs a parse tree or encounters a syntax error. 

This parser requires some data structures, specifically an input buffer for storing the input string, and a stack for storing and accessing the production rules.

The shift and reduce processes are implemented in the corresponding methods from `Parser` class.

```
public shift() {
    const token = this.buffer.shift();
    this.stack.push(token as Token);
    this.ASTNodeStack.push(token);
}

public reduce(sequence: Token[], lhs: string) {
    let tempAstLeaves = [];
    for (let i = 0; i < sequence.length; ++i) {
        this.stack.pop();
        tempAstLeaves.push(this.ASTNodeStack.pop());
    }
    this.ASTNodeStack.push(new AbstractSyntaxTreeNode(lhs, tempAstLeaves));
    this.stack.push(new Token("NON_TERMINAL", lhs));
}
```

During the *shift* process, symbols are transferred from the input buffer to the stack. On the other hand, *reduce* involves checking if the handle (a set of symbols matching a production rule) is present at the top of the stack. If so, the parser performs reduction by applying the appropriate production rule, removing the right-hand side (RHS) symbols from the stack and replacing them with the left-hand side (LHS) symbol. The `findMatchAndReduce` method is in the charge of performing all matching and reduce processes described above.

```
public findMatchAndReduce() {
    for (let i = 0; i < this.stack.length; ++i) {
        const tokenSlice = this.stack.slice(i);
        const tokenSliceWord = this.getStringFrom(tokenSlice);
        const productionsWithSuitableRhs = this.getProductionWithRHS(tokenSliceWord);

        if (
            this.buffer.length == 0 &&
            this.stack.length == 2 &&
            this.stack[1].value === this.grammar.startSymbol
        ) return;

        if (productionsWithSuitableRhs.length > 0) {
            this.reduce(tokenSlice, productionsWithSuitableRhs[0].left);
            i = -1;
        }
    }
}
```

In this particular implementation, while performing reduction, the parser also constructs an AST by working from the leaf nodes towards a single root node. As the final stage of the parsing process, if the input buffer is empty but the stack still contains symbols (excluding the stack marker '$' and the start symbol), the parser rejects the input stream.

For the purpose of illustration, let's examine the grammar for arithmetic expressions, which is located in the `./arithmeticGrammar.ts` directory.

Suppose we have an input string `(a + b)/2`. This string is passed to the lexer, which analyzes it and generates a stream of tokens. This token stream is then fed into the parser. Since the input string conforms to the grammar rules, the parser proceeds with the parsing process and generates an AST represented as nested objects, typically in a JSON format (see `./ASToutput.json` for more detailes).

```
{
  "type": "<expr>",
  "children": [
    {
      "type": "<expr>",
      "children": [
        {
          "type": "<term>",
          "children": [
            {
              "type": "<factor>",
              "children": [
                {
                  "type": "<digit>",
                  "children": [
                    {
                      "type": "INTLITERAL",
                      "value": "2"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "OPERATOR",
      "value": "/"
    },
    {
      "type": "<expr>",
      "children": [
        {
          "type": "<term>",
          "children": [
            {
              "type": "<factor>",
              "children": [
                {
                  "type": "SEPARATOR",
                  "value": ")"
                },
                {
                  "type": "<expr>",
                  "children": [
                    {
                      "type": "<term>",
                      "children": [
                        {
                          "type": "<factor>",
                          "children": [
                            {
                              "type": "<letter>",
                              "children": [
                                {
                                  "type": "IDENTIFIER",
                                  "value": "b"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "OPERATOR",
                      "value": "+"
                    },
                    {
                      "type": "<expr>",
                      "children": [
                        {
                          "type": "<term>",
                          "children": [
                            {
                              "type": "<factor>",
                              "children": [
                                {
                                  "type": "<letter>",
                                  "children": [
                                    {
                                      "type": "IDENTIFIER",
                                      "value": "a"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "SEPARATOR",
                  "value": "("
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

In this specific AST representation, each node has two properties:

1. `type`: This property indicates the type or category of the node, for example `<expr>`, `<term>`, `<factor>`, `<digit>`, `<letter>` (non-terminal symbols); `INTLITERAL`, `IDENTIFIER`, `OPERATOR`, `SEPARATOR` etc (token types). These types correspond to different elements or components of the arithmetic expression;

2. `children` or `value`: The `children` property contains an array of child nodes. It represents the subtree rooted at the current node and captures the hierarchical relationships between nodes. The `value` property is used to store the specific value associated with certain node types. It provides the actual value of the token or symbol from the input stream.

By traversing the AST, one can analyze and evaluate the arithmetic expression, perform optimizations, or generate code based on the captured structure and values.

## Testing and debugging

For testing purposes were written a series of unit tests using Jest testing framework which are located in `./test` directory. In order to run all tests on your local machine, use `yarn test`. For running a particular test file related to lab5, use command `yarn test test/cnfConverter/parser.test.ts`.

An example of unit test is shown below. Can be noticed that there are covered both happy and unhappy cases as well.

```
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
```

Visualisation of different ASTs can be done by modifying the input in the unit-test block and accessing the `./ASToutput.json` directory. If the input stream is rejected, there will be no output in the JSON file.

```
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
```

## Conclusions

Throughout this laboratory work, I delved into the intricacies of parsers, familiarizing myself with their working principles and design specifics. It played a crucial role in solidifying my comprehension of parsing techniques and algorithms. I thoroughly examined various parsing algorithms, including the likes of top-down and bottom-up parsing, acquiring the skills necessary to employ them in scrutinizing the syntax of corresponding inputs.

Undoubtedly, the construction of ASTs represented a pivotal aspect of this lab work. The meticulous process of designing and implementing ASTs as hierarchical representations of program syntactic structures facilitated a profound understanding of capturing interdependencies among language-specific constructs. Consequently, I gained the ability to facilitate further program analysis and transformation by harnessing the power of ASTs.

During the implementation phase, I dedicated myself to crafting a robust parser capable of processing streams of tokens and skillfully constructing ASTs. The construction of essential data structures, such as symbol tables, parsing tables, and stacks, lay at the heart of this implementation, bolstering the parsing process and ensuring its efficiency.

To summarize, the lab work on parsers served as a powerful foundation in parsing techniques, AST construction, and parser implementation. I acquired both theoretical knowledge and practical skills that will undoubtedly prove invaluable in fields such as language processing and compiler construction. By a consistent analysis of the inner workings of parsers and their role in analyzing and processing programming languages, I now stand equipped to tackle future challenges and embark on further exploration in the captivating realm of language design and implementation.

## References

1. [Shift Reduce Parser in Compiler](https://www.geeksforgeeks.org/shift-reduce-parser-compiler/)

2. [Shift Reduce Parser Wiki](https://en.wikipedia.org/wiki/Shift-reduce_parser)
