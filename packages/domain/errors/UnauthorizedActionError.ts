import { LiteFarmError } from "./LiteFarmError";

const TAG = "UNAUTHORIZED_ACTION_ERROR";
export default class UnauthorizedActionError extends LiteFarmError {
  constructor(explanation: string) {
    super(TAG, `${TAG}: ${explanation}`);
  }

  static is(error: LiteFarmError): error is UnauthorizedActionError {
    return error.getTag() === TAG;
  }
}
