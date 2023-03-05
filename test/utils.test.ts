import {
  compareArrays,
  getRandomInt,
  unionArrays
} from "../src/utils";

describe("utils", () => {
  it("should return random int value", () => {
    const number = getRandomInt(10);
    expect(number).toBeGreaterThanOrEqual(0);
    expect(number).toBeLessThanOrEqual(10);
  });

  it("should compare arrays correctly (only content, not position)", () => {
    expect(compareArrays(['1', '2', '3'], ['2', '3', '1'])).toEqual(true);
    expect(compareArrays(['1', '2', '3'], ['4', '3', '1'])).toEqual(false);
  });

  it("should return of arrays", () => {
    expect(unionArrays(['1', '2', '3'], ['3', '1'])).toEqual(['1', '2', '3']);
  });
});