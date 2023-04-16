import {
  areEqual,
  getRandomInt,
  unionArrays,
  differenceArrays
} from "../src/utils";

describe("utils", () => {
  it("should return random int value", () => {
    const number = getRandomInt(10);
    expect(number).toBeGreaterThanOrEqual(0);
    expect(number).toBeLessThanOrEqual(10);
  });

  it("should compare arrays correctly (only content, not position)", () => {
    expect(areEqual(['1', '2', '3'], ['2', '3', '1'])).toEqual(true);
    expect(areEqual(['1', '2', '3'], ['4', '3', '1'])).toEqual(false);
  });

  it("should return union of arrays", () => {
    expect(unionArrays(['1', '2', '3'], ['3', '1'])).toEqual(['1', '2', '3']);
  });

  it("should return difference of arrays", () => {
    expect(differenceArrays(['a', 'c', 'x'], ['c', 'b', 'd'])).toEqual(['a', 'x']);
  });
});