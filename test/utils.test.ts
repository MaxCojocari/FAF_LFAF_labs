import { getRandomInt } from "../src/utils";

describe("utils", () => {
  it("should return random int value", () => {
    const number = getRandomInt(10);
    expect(number).toBeGreaterThanOrEqual(0);
    expect(number).toBeLessThanOrEqual(10);
  });
});