import { LiteFarmError } from "./LiteFarmError";

const TAG = "REPOSITORY_ERROR";
export class RepositoryError extends LiteFarmError {
  constructor(message: string, private readonly error?: unknown) {
    super(
      TAG,
      `${TAG}: ${message} (${
        error && typeof error === "object" && "message" in error
          ? error?.message
          : ""
      })`
    );
  }

  static is(error: LiteFarmError): error is RepositoryError {
    return error.getTag() === TAG;
  }
}
