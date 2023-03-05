import { compareArrays, unionArrays } from "../../utils";
import { CompressedTransition } from "../CompressedTransition";
import { DFA } from "../DFA";
import { FiniteAutomaton } from "../FiniteAutomaton";

export class NFAConvertor {

  // converts NFA to DFA
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

  // returns true if particular state exists in the table
  public static stateExists(
    initialStatesDFA: string[][],
    finalState: string[]
  ): boolean {
    return initialStatesDFA.find(state => compareArrays(finalState, state)) !== undefined;
  }

  // adds new state to the DFA transition table
  public static addNewState(
    prevTransitionTable: CompressedTransition[],
    NFATable: CompressedTransition[],
    newState: string[]
  ): CompressedTransition[] {
    let newTable: CompressedTransition[] = prevTransitionTable;
    newTable.push(new CompressedTransition(newState));

    let resultingFinalStates: Map<string, string[]> = new Map<string, string[]>();

    // for entries in new state
    newState.forEach(state => {
      // find the corresponding row from NFA transition table
      const row = NFATable.find(s => compareArrays(s.previous, [state]))?.final;
      // compute the union of states
      for (let [key, value] of row as Map<string, string[]>) {
        if (!resultingFinalStates.get(key)) {
          resultingFinalStates.set(key, []);
        }
        if (row?.get(key)) {
          resultingFinalStates.set(key, unionArrays(resultingFinalStates.get(key) as string[], value));
        }
      }
    });
    // add to the end of the table
    newTable[newTable.length - 1].final = resultingFinalStates;

    return newTable;
  }
}