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
