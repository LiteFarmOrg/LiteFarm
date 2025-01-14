/*
 *  Copyright 2024 LiteFarm.org
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

import AnimalIdentifierType from '../models/animalIdentifierTypeModel.js';

async function getIdentifierTypes(_, res) {
  try {
    return res.status(200).send(await AnimalIdentifierType.query());
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error,
    });
  }
}

export { getIdentifierTypes };
