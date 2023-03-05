# Laboratory work nr.2

### Course: Formal Languages & Finite Automata
### Author: Maxim Cojocari-Goncear

----

## Theory

Deterministic Finite Automaton (or DFA shortly) is a mathematical model used to recognize and accept or reject input strings in a formal language. A DFA consists of a finite set of states, a finite set of input symbols, a transition function that maps each state and input symbol to a new state, a start state, and a set of accepting states.

Non-Deterministic Finite Automaton is simmilar to DFA, but it allows 
for multiple possible transitions from a given state with a given input symbol, or epsilon transitions which allow it to make a transition without consuming an input symbol. When processing an input string, the NFA can follow any path through its state graph that matches the input string.

At the end of the input string, if the DFA/NFA is in any of its accepting states, the input string is accepted. Otherwise, the input string is rejected.

Any DFA can be NFA, but not vice-versa. The corresponding NFA can be converted to DFA using appropriate algorithm.

According to Chomsky, grammars can be classified into four types [1]:

- Type 0. Recursively Enumerable Grammar: no restrictions on productions
$$\alpha \to \beta.$$

- Type 1. Context-Sensitive Grammars: all productions are of the form: $$\alpha_1 A \alpha_2 \to \alpha_1 \beta \alpha_2,$$ where $\alpha_1, \alpha_2 \in (V_N \cap V_T)^*, \beta \in (V_N \cap V_T)^+, A \in V_N$. There are left context-sensitive grammar and right context-sensitive grammar.

- Type 2. Context-Free Grammar: all productions of grammar must be in form $$A \to \beta, A \in V_N, \beta \in (V_N \cap V_T)^* .$$

- Type 3. Regular Grammar: this is most restricted grammar and has two representations: right linear grammar $(A \to aB, A \to a)$, left linear grammar $(A \to Ba, A \to a)$. In all cases $a \in V_T$ and $A, B \in V_N.$

## Objectives

1. Get familliar with the notion of automaton and its applications;
2. Recognize grammar type according to Chomsky hierarchy;
3. Implement an algorithms for conversion of a finite automaton to a regular grammar;
4. Classify FA into DFA or NFA by implementing features able to cathegorize them accordingly;
5. Differentiate between NFA and DFA, implement some functionality that would convert NFA to DFA;
6. Represent the finite automaton graphically.

## Implementation description

To start with, in this current implementation I added multiple features according to specifications required. 

The classification of grammars based on Chomsky hierarchy is done in `GrammarChecker.ts`. The `getGrammarType` method gives a string output ("type 0", "type 1", ...) based on the grammar type found.

```
public static getGrammarType(grammar: Grammar): string {
  if (this.isRegularGrammar(grammar)) return "type 3";
  else if (this.isContextFreeGrammar(grammar)) return "type 2";
  else if (this.isContextSensitiveGrammar(grammar)) return "type 1";
  else return "type 0";
}
```
The method itself is split into multiple submethods which detect the particular type correspondingly. To exemplify, 

```
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
```
the `isRegularGrammar` method identifies if an object of `Grammar` type is a regular grammar or not. The algorithm carefully analysis the left and right parts of each element of production set and returns the corresponding boolean. Can be also found if it is right/left regular grammar, depending on the case.

The conversion of a finite automaton to a regular grammar is made in `AutomatonToGrammarConvertor` class in `./src/automaton/conversion/AutomatonToGrammarConvertor.ts` directory. 

```
public static toRegularGrammar(FA: FiniteAutomaton): Grammar {
  let nonTerminalSymbols = FA.setOfStates;
  let terminalSymbols = FA.alphabet;
  let startSymbol = FA.intialState;
  let productions = this.getProductions(FA);
  return new Grammar(nonTerminalSymbols, terminalSymbols, productions, startSymbol);
}
```

The `toRegularGrammar` method converts FA to regular grammar. Each term of FA 5-tuple is rewritten in grammar quadruple form $G = (V_N, V_T, P, S)$ and returns a new `Grammar` object.

The DFA/NFA classification is done in the static method `isDFA` of `DFA` class. It checks if there are ε-transitions and transitions which consume the same char but directs to two or more different states.

```
public static isDFA(FA: FiniteAutomaton): boolean {
  let transitionLabels: Map<string, string[]> = new Map<string, string[]>();

  for (let t of FA.transitions) {
    // if there is an ε-transition, it's not DFA
    if (!t.transitionLabel) return false;

    if (transitionLabels.has(t.current)) {
      let labels = transitionLabels.get(t.current);

      // if there are transitions with same init state and 
      // transition label, then it's not DFA 
      // (same transitions go to different states)
      if (labels?.includes(t.transitionLabel))
        return false;

      // else add new transition label
      else {
        labels?.push(t.transitionLabel);
      }

      // if no initial state was found, set a new pair
    } else {
      transitionLabels.set(t.current, [t.transitionLabel]);
    }
  }
  return true;
}
```

If `isDFA` returns false, then the FA is a non-determenistic FA.

The conversion between NFA to DFA is done in `NFAConvertor` class (see `./src/automaton/conversion/NFAConvertor.ts`). There can be found the main method `toDFA` which does the conversion itself and a set of helper methods included in the core method. The algorithm in `toDFA` method implements the following flow of steps [1]:

1. Create the transition table for the given NFA;
2. Create a new transition table under possible input alphabets for the equivalent DFA;
3. Mark the start state of the DFA by ${q_0}$ (same as the NFA);
4. Find out the combination of states ${q_0, q_1, ..., q_n}$ for each possible input alphabet;
5. Each time when a new DFA state is generated under the input alphabet columns, go to step 4, otherwise go to the next step;
6. The states which contain any of the final states of the NFA are the final states of the equivalent DFA.

```
public static toDFA(NFA: FiniteAutomaton): CompressedTransition[] {
  let transitionTable: CompressedTransition[] = [];
  let NFATable: CompressedTransition[] = DFA.getTransitionTable(NFA);

  // if NFA is already a DFA, stop
  if (DFA.isDFA(NFA)) return NFATable;

  // push initial state in freshly created transition table
  transitionTable.push(
    NFATable.find(state => compareArrays([NFA.intialState], state.previous)) as CompressedTransition
  )

  let initialStatesDFA: string[][] = [];
  initialStatesDFA.push([NFA.intialState]);

  // for each entry in DFA table
  for (let entry of transitionTable) {
    // for each state in the row
    for (let finalState of entry.final.values()) {
      // if there is a new final state in the table
      if (!this.stateExists(initialStatesDFA, finalState)) {
        // add new state to the table
        initialStatesDFA.push(finalState);
        transitionTable = this.addNewState(transitionTable, NFATable, finalState);
      }
    }
  }

  return transitionTable;
}
```

The `CompressedTransition` class represents a mapping data structure that contains a compressed information about initial state and all possible states reachable by the FA. For example, this instance

```
CompressedTransition {
  previous: [ 'q0' ],
  final: Map(2) { 'a' => [ 'q0', 'q1' ], 'b' => [ 'q2' ] }
}
```

shows that starting from $q_0$, through $a$ can be reached states $q_0$ and $q_1$, through $b$ can be reached state $q_2$.

For graphical representation, was used a JS library called `d3-graphviz`. The `graph.html` file contains all imports and scripts needed to accomplish this task. In order to obtain a visualisation of a different DFA, follow this steps:

1. In `dfa.test.ts`, find the first test (line 18) and introduce the parameters of your DFA;
2. Run `yarn test test/dfa.test.ts`;
3. Find in the root of the project the `plainGraph.txt` file and copy the contents of it;
4. Input the copied string into `inputGraph` variable and open `graph.html` in your favourite browser.

For variant 11, the output for corresponding DFA should look like this:

![image](https://user-images.githubusercontent.com/92053176/222961957-9cea8ca3-1f0b-4226-9808-60acfcc93119.png)



## Testing and debugging

For testing purposes were written a series of unit tests using Jest testing framework which are located in `test/` directory. In order to run all tests on your local machine, use `yarn test`. On the console you should see approximatelly the following output.

![image](https://user-images.githubusercontent.com/92053176/222962862-bbb18525-806e-412d-b5b6-6a3c8a42cc9d.png)


## Conclusions

In this laboratory work, I explored the Chomsky hierarchy of grammars and the concepts of nondeterministic finite automata (NFA) and deterministic finite automata (DFA). I learned that grammars can be classified into four types based on their rules for generating strings: Type 0 (unrestricted), Type 1 (context-sensitive), Type 2 (context-free), and Type 3 (regular).

Then I focused on the concepts of NFA and DFA and how they differ in their representations and core ideas. For example, NFAs have the ability to make multiple transitions from a single state on a given input symbol or no input symbol at all, while DFAs make a single transition on a given input symbol from each state. I also learned how to convert an NFA to a DFA by designing an algortihm that uses tabular approach for conversion. The results were analyzed and graphically represented using corresponding tools. As well, were developed features for determining if a finite automaton is NFA or DFA and conversion of DFA to a regular grammar.

Overall, this laboratory work helped me gain a better understanding of the Chomsky hierarchy of grammars, as well as the differences and similarities between NFAs and DFAs. These concepts are important in the field of computer science, particularly in the study of formal languages and automata theory.

## References

1. COJUHARI, I., Formal Languages and Finite Automata, Guide for practical lessons. Publisher: Editura „Tehnica-UTM”, 2022 