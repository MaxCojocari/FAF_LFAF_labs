import { Transition } from "./Transition";

export class FiniteAutomaton {
  public readonly setOfStates: string[];
  public readonly alphabet: string[];
  public readonly transitions: Transition[];
  public readonly intialState: string;
  public readonly finalState: string;

  public constructor(
    setOfStates: string[],
    alphabet: string[],
    transitions: Transition[],
    intialState: string,
    finalState: string
  ) {
    this.setOfStates = setOfStates;
    this.alphabet = alphabet;
    this.transitions = transitions;
    this.intialState = intialState;
    this.finalState = finalState;
  }

  public stringBelongToLanguage(word: string): boolean {
    // Initialize the automaton in its starting state.
    let currentState = this.intialState;

    let i = 0;

    // For each character in the string
    for (i = 0; i < word.length; ++i) {

      for (let j = 0; j < this.transitions.length; ++j) {

        // Check if there is a transition from the current state 
        // to a next state for the current character
        if (
          this.transitions[j].current === currentState &&
          this.transitions[j].transitionLabel === word[i]
        ) {

          // If there is a transition, move to the next state
          currentState = this.transitions[j].next;

          // If the automaton reaches an accepting state, 
          // then the string belongs to the language defined by the grammar
          if (currentState === this.finalState) {
            return i + 1 == word.length
          };
          break
        }
      }
    }

    // If there is no transition, the string does not belong 
    // to the language defined by the grammar
    return false;
  }
}