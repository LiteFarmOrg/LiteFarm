import { LiteFarmError } from "../../errors/LiteFarmError";

const TAG = "TASK_NOT_FOUND_ERROR";

export default class TaskNotFoundError extends LiteFarmError {
  constructor(task_id: string) {
    super(TAG, `Could not find task ${task_id}`);
  }

  static is(error: LiteFarmError): error is TaskNotFoundError {
    return error.getTag() === TAG;
  }
}
