export class Transition {
  public readonly current: string;
  public readonly next: string;
  public readonly transitionLabel: string;

  public constructor(
    current: string,
    transitionLabel: string,
    next: string
  ) {
    this.current = current;
    this.next = next;
    this.transitionLabel = transitionLabel;
  }
}