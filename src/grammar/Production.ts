export class Production {
  public left: string;
  public right: string;

  public constructor(left: string, right: string) {
    this.left = left;
    this.right = right;
  }

  public setRHS(right: string) {
    this.right = right;
  }
}