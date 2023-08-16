import { LiteFarmError } from "./LiteFarmError";

const TAG = "FARM_MISMATCH_ERROR";
export default class FarmMismatchError extends LiteFarmError {
  constructor(expectedFarmId: string, declaredFarmId: string) {
    super(
      TAG,
      `Farm mismatch: Declared farm ID ${declaredFarmId} but found farm ID ${expectedFarmId}`
    );
  }

  static is(error: LiteFarmError): error is FarmMismatchError {
    return error.getTag() === TAG;
  }
}
