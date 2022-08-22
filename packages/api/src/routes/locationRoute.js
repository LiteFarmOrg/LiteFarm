/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify`
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

import LocationController from '../controllers/locationController.js';

import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import { modelMapping } from '../middleware/validation/location.js';
import validateLocationDependency from '../middleware/validation/deleteLocation.js';
import organicHistoryController from '../controllers/organicHistoryController.js';

import {
  organicHistoryLocationCheckOnPost,
  organicHistoryCheckOnPut,
  organicHistoryCheckOnPost,
} from '../middleware/validation/organicHistoryLocationCheck.js';

router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:fields']),
  LocationController.getLocationsByFarm(),
);

router.delete(
  '/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['delete:fields']),
  validateLocationDependency,
  LocationController.deleteLocation(),
);

// TODO: to deprecate
router.get(
  '/check_delete/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['delete:fields']),
  validateLocationDependency,
  LocationController.checkDeleteLocation(),
);

router.get(
  '/:location_id/organic_history',
  hasFarmAccess({ param: 'location_id' }),
  checkScope(['get:organic_history']),
  organicHistoryController.getOrganicHistory,
);

router.post(
  '/gate',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:gate']),
  modelMapping['gate'],
  LocationController.createLocation('gate'),
);

router.post(
  '/water_valve',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:water_valve']),
  modelMapping['water_valve'],
  LocationController.createLocation('water_valve'),
);

router.post(
  '/buffer_zone',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:buffer_zone']),
  modelMapping['buffer_zone'],
  LocationController.createLocation('buffer_zone'),
);

router.post(
  '/watercourse',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:watercourse']),
  modelMapping['watercourse'],
  LocationController.createLocation('watercourse'),
);

router.post(
  '/fence',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:fence']),
  modelMapping['fence'],
  LocationController.createLocation('fence'),
);

router.post(
  '/ceremonial_area',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:ceremonial_area']),
  modelMapping['ceremonial_area'],
  LocationController.createLocation('ceremonial_area'),
);

router.post(
  '/residence',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:residence']),
  modelMapping['residence'],
  LocationController.createLocation('residence'),
);

router.post(
  '/surface_water',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:surface_water']),
  modelMapping['surface_water'],
  LocationController.createLocation('surface_water'),
);

router.post(
  '/natural_area',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:natural_area']),
  modelMapping['natural_area'],
  LocationController.createLocation('natural_area'),
);

router.post(
  '/greenhouse',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:greenhouse']),
  modelMapping['greenhouse'],
  organicHistoryCheckOnPost,
  LocationController.createLocation('greenhouse'),
);

router.post(
  '/barn',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:barn']),
  modelMapping['barn'],
  LocationController.createLocation('barn'),
);

router.post(
  '/field',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:fields']),
  modelMapping['field'],
  organicHistoryCheckOnPost,
  LocationController.createLocation('field'),
);

router.post(
  '/garden',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:garden']),
  modelMapping['garden'],
  organicHistoryCheckOnPost,
  LocationController.createLocation('garden'),
);

router.post(
  '/farm_site_boundary',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:farm_site_boundary']),
  modelMapping['farm_site_boundary'],
  LocationController.createLocation('farm_site_boundary'),
);

router.post(
  '/organic_history',
  hasFarmAccess({ body: 'location_id' }),
  checkScope(['add:organic_history']),
  organicHistoryLocationCheckOnPost,
  organicHistoryController.addOrganicHistory(),
);

router.put(
  '/field/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:fields']),
  modelMapping['field'],
  organicHistoryCheckOnPut,
  LocationController.updateLocation('field'),
);

router.put(
  '/garden/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:garden']),
  modelMapping['garden'],
  organicHistoryCheckOnPut,
  LocationController.updateLocation('garden'),
);

router.put(
  '/barn/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:barn']),
  modelMapping['barn'],
  LocationController.updateLocation('barn'),
);

router.put(
  '/gate/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:gate']),
  modelMapping['gate'],
  LocationController.updateLocation('gate'),
);

router.put(
  '/water_valve/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:water_valve']),
  modelMapping['water_valve'],
  LocationController.updateLocation('water_valve'),
);

router.put(
  '/buffer_zone/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:buffer_zone']),
  modelMapping['buffer_zone'],
  LocationController.updateLocation('buffer_zone'),
);

router.put(
  '/watercourse/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:watercourse']),
  modelMapping['watercourse'],
  LocationController.updateLocation('watercourse'),
);

router.put(
  '/fence/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:fence']),
  modelMapping['fence'],
  LocationController.updateLocation('fence'),
);

router.put(
  '/ceremonial_area/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:ceremonial_area']),
  modelMapping['ceremonial_area'],
  LocationController.updateLocation('ceremonial_area'),
);

router.put(
  '/residence/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:residence']),
  modelMapping['residence'],
  LocationController.updateLocation('residence'),
);

router.put(
  '/surface_water/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:surface_water']),
  modelMapping['surface_water'],
  LocationController.updateLocation('surface_water'),
);

router.put(
  '/natural_area/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:natural_area']),
  modelMapping['natural_area'],
  LocationController.updateLocation('natural_area'),
);

router.put(
  '/greenhouse/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:greenhouse']),
  modelMapping['greenhouse'],
  organicHistoryCheckOnPut,
  LocationController.updateLocation('greenhouse'),
);

router.put(
  '/farm_site_boundary/:location_id',
  hasFarmAccess({ params: 'location_id' }),
  checkScope(['edit:farm_site_boundary']),
  modelMapping['farm_site_boundary'],
  LocationController.updateLocation('farm_site_boundary'),
);

export default router;
