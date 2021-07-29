/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldRoute.js) is part of LiteFarm.
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

const express = require('express');
const router = express.Router();
const { getLocationsByFarm, deleteLocation, checkDeleteLocation,
  createLocation, updateLocation } = require('../controllers/locationController');
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const { modelMapping } = require('../middleware/validation/location');
// const validateLocationDependency = require('../middleware/validation/deleteLocation');

router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:fields']),
  getLocationsByFarm());

router.delete('/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['delete:fields']),
  // validateLocationDependency,
  deleteLocation());

// TODO: to deprecate
router.get('/check_delete/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['delete:fields']),
  // validateLocationDependency,
  checkDeleteLocation())

router.post('/gate', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:gate']),
  modelMapping['gate'],
  createLocation('gate'));

router.post('/water_valve', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:water_valve']),
  modelMapping['water_valve'], createLocation('water_valve'));

router.post('/buffer_zone', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:buffer_zone']),
  modelMapping['buffer_zone'], createLocation('buffer_zone'));

router.post('/watercourse', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:watercourse']),
  modelMapping['watercourse'], createLocation('watercourse'));

router.post('/fence', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:fence']),
  modelMapping['fence'], createLocation('fence'));

router.post('/ceremonial_area', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:ceremonial_area']),
  modelMapping['ceremonial_area'], createLocation('ceremonial_area'));

router.post('/residence', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:residence']),
  modelMapping['residence'], createLocation('residence'));

router.post('/surface_water', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:surface_water']),
  modelMapping['surface_water'], createLocation('surface_water'));

router.post('/natural_area', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:natural_area']),
  modelMapping['natural_area'], createLocation('natural_area'));

router.post('/greenhouse', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:greenhouse']),
  modelMapping['greenhouse'], createLocation('greenhouse'));

router.post('/barn', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:barn']),
  modelMapping['barn'], createLocation('barn'));

router.post('/field', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:fields']),
  modelMapping['field'], createLocation('field'));

router.post('/garden', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:garden']),
  modelMapping['garden'], createLocation('garden'));

router.post('/farm_site_boundary', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:farm_site_boundary']),
  modelMapping['farm_site_boundary'], createLocation('farm_site_boundary'));


router.put('/field/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:fields']),
  modelMapping['field'], updateLocation('field'));

router.put('/garden/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:garden']),
  modelMapping['garden'], updateLocation('garden'));

router.put('/barn/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:barn']),
  modelMapping['barn'], updateLocation('barn'));

router.put('/gate/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:gate']),
  modelMapping['gate'], updateLocation('gate'));

router.put('/water_valve/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:water_valve']),
  modelMapping['water_valve'], updateLocation('water_valve'));

router.put('/buffer_zone/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:buffer_zone']),
  modelMapping['buffer_zone'], updateLocation('buffer_zone'));

router.put('/watercourse/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:watercourse']),
  modelMapping['watercourse'], updateLocation('watercourse'));

router.put('/fence/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:fence']),
  modelMapping['fence'], updateLocation('fence'));

router.put('/ceremonial_area/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:ceremonial_area']),
  modelMapping['ceremonial_area'], updateLocation('ceremonial_area'));

router.put('/residence/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:residence']),
  modelMapping['residence'], updateLocation('residence'));

router.put('/surface_water/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:surface_water']),
  modelMapping['surface_water'], updateLocation('surface_water'));

router.put('/natural_area/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:natural_area']),
  modelMapping['natural_area'], updateLocation('natural_area'));

router.put('/greenhouse/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:greenhouse']),
  modelMapping['greenhouse'], updateLocation('greenhouse'));

router.put('/farm_site_boundary/:location_id', hasFarmAccess({ params: 'location_id' }), checkScope(['edit:farm_site_boundary']),
  modelMapping['farm_site_boundary'], updateLocation('farm_site_boundary'));


module.exports = router;
