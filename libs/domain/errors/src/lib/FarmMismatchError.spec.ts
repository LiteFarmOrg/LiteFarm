import { FarmMismatchError } from "./FarmMismatchError";

describe("FarmMismatchError", () => {
  const error = new FarmMismatchError("1", "2");

  it("validates own instances", () => {
    expect(FarmMismatchError.is(error)).toEqual(true);
  });
});
