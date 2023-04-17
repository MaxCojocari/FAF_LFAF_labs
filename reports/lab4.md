# Laboratory work nr.4

### Course: Formal Languages & Finite Automata
### Author: Maxim Cojocari-Goncear

----

## Theory

Chomsky Normal Form (CNF) is a standard form of context-free grammars (CFGs). In CNF, each production rule of the CFG is either of the form $A \to BC$, $A \to a$, or $S \to \varepsilon$ where $A$, $B$, and $C$ are nonterminal symbols, $S$ is a start symbol, and $a$ is a terminal symbol.

CNF has several advantages for natural language processing tasks. For example, it makes it easier to parse sentences, and it can reduce ambiguity in the grammar. Additionally, converting a CFG to CNF can simplify various language modeling algorithms, as it eliminates certain types of productions that can cause troubles for them.

The process of converting a CFG to CNF involves several steps, including removing lambda productions, removing unit productions, and transforming productions with three or more nonterminal symbols. While the process can be complex, it can result in a more robust and efficient grammar for predefined processing tasks.

## Objectives

1. Learning about Chomsky Normal Form (CNF);
2. Getting familiar with the principles of normalizing a grammar;
3. Implementing a CNF converter and demonstrating its features.

## Implementation description

This implementation of CNF converter accepts all grammars and modifies them correspondingly. Check unit tests to ensure yourself that everything works fine.

The core implementation ideas for Chomsky Normal Form converter can be found in `./src/grammar/conversion/CNFConverter.ts` directory. The `CNFConverter` class initialises four distinct classes responsible for removal of specific symbols or productions:
    
- `LambdaProductionRemover` - removes lambda productions;
- `UnitProductionRemover`- removes all unit productions;
- `InaccessibleSymbolRemover` - manages al inaccessible symbols and deletes them;
- `NonProductiveSymbolRemover` - deletes all non productive symbols;

The entire process is focused on `convertToCNF` method which does all the magic regarding the whole process of normalization. It includes

- Verifying the presence of start symbol in right hand side, if yes, adding a new production $S_0 \to S$ where $S_0$ is a new start symbol;
- Grammar pre-processing before the production normalisation, i.e 
    - removal of lambda productions;
    - removal of unit productions;
    - removal of inaccessible symbols;
    - removal of non-productive symbols;
- Normalization of productions according to CNF rules;
- Setting components into a new, normalized grammar.

```
public convertToCNF(G: Grammar): Grammar {
    this.checkForStartSymbolInRHS(G);
    this.prepareGrammarForCNF(G);

    let [nonTerminalSymbols, processedProductions] = this.convertProductionsToCNF(G);

    G.setNonTerminalSymbols(nonTerminalSymbols);
    G.setProductions(this.sortProductions(processedProductions));
    return G;
}
```

There is also an aditional step of sorting productions, which resides in putting productions with $S_0$ first, then $S$, $A$, $B$, ..., in alphabetical order.

The process of grammar preparation before production normalization can be found in `prepareGrammarForCNF` method.

```
public prepareGrammarForCNF(grammar: Grammar) {
    this.lambdaProductionRemover.removeLambdaProductions(grammar);
    this.unitProductionRemover.removeUnitProductions(grammar);
    this.inaccessibleSymbolRemover.removeInaccessibleSymbols(grammar);
    this.nonProductiveSymbolRemover.removeNonProductiveSymbols(grammar);

    const sortedProductions = this.sortProductions(grammar.productions);
    grammar.setProductions(sortedProductions);
}
```

The `convertProductionsToCNF` method and its helper method `splitProduction` rewrite productions in normalized form $A \to BC$, $A \to a$ or $S \to \varepsilon$.

```
public convertProductionsToCNF(G: Grammar): [string[], Production[]] {
    ...
    while (!this.isGrammarInCNF(productions, terminalSymbols, nonTerminalSymbols)) {
        iterations++;
        processedProductions = [];
        for (let p of productions) {
            if (this.isProductionNormalized(p, terminalSymbols, nonTerminalSymbols)) {
                processedProductions.push(p);
                continue;
            };
            [asciiVal, newProduction, newProductions] =
                this.splitProduction(
                    p,
                    asciiVal,
                    nonTerminalSymbols,
                    G.nonTerminalSymbols,
                    terminalSymbols,
                    iterations == 1 ? processedProductions : productions
                );
            processedProductions = [...processedProductions, newProduction, ...newProductions]
        }
        productions = [...processedProductions];
    }

    return [nonTerminalSymbols, productions];
}
```

### Removing $\lambda$-productions

The `LambdaProductionRemover` class (`./src/grammar/LambdaProductionRemover.ts`) is in charge of removal of all lambda productions and substitution of all possible combinations which may result in new produtions.

The algorithm resides in the following steps:

1. Identify all nonterminal symbols that can derive lambda by iterating over all productions and finding any that have a lambda (empty string) as a possible derivation;
2. For each lambda nonterminal symbol, create new productions without the lambda symbol:
    
    a. Iterate over all productions for each nonterminal symbol in the grammar;
    
    b. For each production that includes a lambda nonterminal symbol, create a new production for each possible subset of the original production that excludes the lambda symbol. This means for each occurrence of the lambda nonterminal symbol, we create two new productions: one with the lambda symbol removed and one with the corresponding terminal symbol removed (if it exists);
    
    c. Add the new productions to the grammar.

3. Remove all lambda productions from the grammar:
    
    a. Iterate over all productions for each nonterminal symbol in the grammar;
    
    b. Remove any productions that include the lambda symbol.

The `removeLambdaProductions` ,ethod resumes all steps described above.

```
public removeLambdaProductions(grammar: Grammar) {
    let productions: Production[] = grammar.productions;

    while (this.isThereLambdaProduction(productions)) {
        const [indexToRemove, lambdaProduction] = this.getNextLambdaProduction(productions);

        // remove lambda production found
        productions =
            [
                ...productions.slice(0, indexToRemove),
                ...productions.slice(indexToRemove + 1)
            ]

        if (lambdaProduction?.left === grammar.startSymbol) continue;

        // replace lambda productions with new productions that generate 
        // all possible combinations of non-terminals that don't include the empty string
        productions.forEach(p => {
            this.substituteAllLambdaCombinations(p, lambdaProduction as Production, productions);
        });
    }

    grammar.setProductions(productions);
}
```

### Removing unit productions

The removal of all unit productions is done by `UnitProductionRemover` class (`./src/grammar/UnitProductionRemover.ts`).

The algorithm in brief:

1. For all productions $A \to B$ add the new production $A \to x$, where $B \to x$ and $x \in (V_N \cup V_T)$;
2. Remove production $A \to B$;
3. Repeat 2nd step until all unit productions are removed.

```
public removeLambdaProductions(grammar: Grammar) {
    let productions: Production[] = grammar.productions;

    while (this.isThereLambdaProduction(productions)) {
        const [indexToRemove, lambdaProduction] = this.getNextLambdaProduction(productions);

        // remove lambda production found
        productions =
            [
                ...productions.slice(0, indexToRemove),
                ...productions.slice(indexToRemove + 1)
            ]

        if (lambdaProduction?.left === grammar.startSymbol) continue;

        // replace lambda productions with new productions that generate 
        // all possible combinations of non-terminals that don't include the empty string
        productions.forEach(p => {
            this.substituteAllLambdaCombinations(p, lambdaProduction as Production, productions);
        });
    }

    grammar.setProductions(productions);
}
```

### Removing inaccessible symbols

The implementation for removal of all inaccessible symbols can be found in `InaccessibleSymbolRemover` class (`./src/grammar/InaccessibleSymbolRemover.ts`).

The algorithm in brief:

1. Create a new set which will keep track of all accessible symbols $A_c = \lbrace S \rbrace$;

2. For all non-terminal symbols $\beta \to A_c$ and all productions
$\beta \to x_1, x_2, x_3, …, x_n$ modify set

$$A_c = A_c \cup \lbrace x_1, x_2, x_3, …, x_n \rbrace$$

3. If in the 2nd step some changes were happened in $A_c$, then repeat the 2nd
step, otherwise move to the step 4;

4. Build the set of inaccessible symbols $I = (V_N \cup V_T) \setminus A_c$ . From productions $P$ remove all productions that contain at least one inaccessible symbol.

```
public removeInaccessibleSymbols(grammar: Grammar) {
    const inaccessibleSymbols: string[] = this.getInaccessibleSymbols(grammar);
    let filteredProductions: Production[] = grammar.productions;
    let filteredTerminalSymbols: string[] = grammar.terminalSymbols;
    let filteredNonTerminalSymbols: string[] = grammar.nonTerminalSymbols;

    inaccessibleSymbols.forEach(inaccessibleSymbol => {
        [filteredTerminalSymbols, filteredNonTerminalSymbols] =
            this.removeInaccessibleSymbol(inaccessibleSymbol, filteredTerminalSymbols, filteredNonTerminalSymbols);

        while (!isRemovalComplete(filteredProductions, inaccessibleSymbol)) {
            const [indexToRemove] = getProductionBySymbol(filteredProductions, inaccessibleSymbol);
            filteredProductions =
                [
                    ...filteredProductions.slice(0, indexToRemove),
                    ...filteredProductions.slice(indexToRemove + 1)
                ]
        }
    });

    grammar.setNonTerminalSymbols(filteredNonTerminalSymbols);
    grammar.setTerminalSymbols(filteredTerminalSymbols);
    grammar.setProductions(filteredProductions);
}
```

### Removing non-productive symbols

The implementation for removal of all non-productive symbols can be found in `NonProductiveSymbolRemover` class (`./src/grammar/NonProductiveSymbolRemover.ts`).

The algorithm in brief:
1. Create new set $P_r = \emptyset$;
2. 
    a. For all productions $A \to \alpha$, where $\alpha \to V_T^*$ change set:
    $$P_r = P_r \cup \lbrace A \rbrace$$

    b. For all productions $B \to \beta$, where $\beta \in (V_T \cup P_r)$ change set:
    $$Pr = Pr \cup \lbrace B \rbrace$$
3. While some changes are met in the set $P_r$, repeat the 2nd step.

```
public removeNonProductiveSymbols(grammar: Grammar) {
    const Pr: string[] = this.getProductiveSymbolsSet(grammar);
    const N: string[] = differenceArrays(grammar.nonTerminalSymbols, Pr);
    let filteredProductions = grammar.productions;
    let filteredNonTerminalSymbols: string[] = grammar.nonTerminalSymbols;

    N.forEach(nonProductiveSymbol => {
        [filteredNonTerminalSymbols, filteredProductions] =
            this.removeNonProductiveSymbol(filteredNonTerminalSymbols, nonProductiveSymbol, filteredProductions);
    });

    grammar.setNonTerminalSymbols(filteredNonTerminalSymbols);
    grammar.setProductions(filteredProductions);
}
```

## Testing and debugging

For testing purposes were written a series of unit tests using Jest testing framework which are located in `test/` directory. In order to run all tests on your local machine, use `yarn test`. For running a particular test file, use `yarn test test/cnfConverter/file.test.ts`.

All tests relevant to CNF converter are located in `./test/grammar/cnfConverter` directory. Each test file contains unit tests for classes described in previous sections.

The converted grammar from variant 11 is shown below:

![image](https://user-images.githubusercontent.com/92053176/232454084-d586dccf-a96a-4b6d-9cbb-730613e1a2ff.png)
![image](https://user-images.githubusercontent.com/92053176/232454331-811c7340-3d82-4612-a43d-51deebe10041.png)

## Conclusions

In this laboratory work a learned about Chomsky Normal Form (CNF) and created the corresponding converter based on CNF rules. CNF is a standard form of context-free grammars (CFGs) that has proven to be very useful in various grammar processing tasks. By transforming CFGs into CNF, we can simplify various language modeling algorithms and make them more efficient and accurate.

Through the process of designing the system for converting CFGs to CNF, I have learned various techniques, such as removing lambda productions, removing unit productions, and transforming productions with more than two nonterminal symbols. While this process can be complex and time-consuming, the resulting CNF grammar can be more efficient and robust for specific applications.

In addition to its practical applications, studying CNF has helped me to gain a deeper understanding of formal languages and automata theory. By learning about the properties of CNF, I can now better understand the structure of natural languages and the ways in which they can be analyzed and processed. The Chomsky Normal Form is an important concept in the field of natural language processing, and understanding it can be a valuable tool for developing more effective algorithms and systems.


## References

1. Compilers: Principles, Techniques, and Tools (2nd edition). Alfred V. Aho, Monica S. Lam, Ravi Sethi and Jeff Ullman. Publisher: Addison Wesley, 2007

2. COJUHARI, I., Formal Languages and Finite Automata, Guide for practical lessons. Publisher: Editura „Tehnica-UTM”, 2022 