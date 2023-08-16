/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
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
