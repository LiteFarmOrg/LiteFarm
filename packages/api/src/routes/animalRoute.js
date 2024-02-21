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

import express from 'express';

const router = express.Router();
import checkScope from '../middleware/acl/checkScope.js';
import AnimalController from '../controllers/animalController.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';

// Just a demonstration! Not recommended
// Also only applicable when sending one animal per request (not an array)
export const animalHasRecordAccess = () => {
  return async function (req, res, next) {
    const animal = req.body;
    req.body = { ...req.body, animal_id: animal.id }; // something like
    await hasFarmAccess({ body: 'animal_id' })(req, res, next);
  };
};

router.get('/', checkScope(['get:animals']), AnimalController.getFarmAnimals());
router.post('/', checkScope(['add:animals']), AnimalController.addAnimals());
router.patch(
  '/',
  checkScope(['edit:animals']),
  // can't use hasFarmAccess; body is an array, and 'id' property is also problematic as we would have needed to map it one-to-one to a getter
  AnimalController.editAnimals(),
);

export default router;
