import { unionArrays } from "../utils";

export class CompressedTransition {
  previous: string[];

  // transition -> set of final states
  final: Map<string, string[]>;

  constructor(previous: string[]) {
    this.previous = previous;
    this.final = new Map<string, string[]>();
  }

  public addTransitionPart(transitionlabel: string, next: string[]): CompressedTransition {
    if (Array.from(this.final.keys()).includes(transitionlabel)) {
      const arr1 = this.final.get(transitionlabel);
      const arr2 = next;
      const concatArr = unionArrays(arr1 as string[], arr2);
      this.final.set(transitionlabel, concatArr);
    } else {
      this.final.set(transitionlabel, next);
    }
    return this;
  }
}