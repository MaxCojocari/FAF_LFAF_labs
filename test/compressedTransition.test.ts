import { CompressedTransition } from "../src";

describe("CompressedTransition", () => {
  let compressedTransition: CompressedTransition;

  it("should construct new instance", () => {
    compressedTransition = new CompressedTransition(['q0', 'q1']);
    expect(compressedTransition.previous).toEqual(['q0', 'q1']);
  });

  it("should add new transition sequence", () => {
    compressedTransition.addTransitionPart('a', ['q1']);
    compressedTransition.addTransitionPart('a', ['q2']);
    compressedTransition.addTransitionPart('b', ['q0']);

    expect(compressedTransition).toEqual(
      new CompressedTransition(['q0', 'q1'])
        .addTransitionPart('a', ['q1', 'q2'])
        .addTransitionPart('b', ['q0'])
    );
  });
});