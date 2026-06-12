/*
 *  Copyright 2026 LiteFarm.org
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

// Location route configuration - maps location type to enabled tabs
export const locationRouteConfig = {
  field: {
    enabledTabs: ['details', 'crops', 'tasks', 'field_technology', 'irrigation'],
  },
  garden: {
    enabledTabs: ['details', 'crops', 'tasks', 'field_technology', 'irrigation'],
  },
  greenhouse: {
    enabledTabs: ['details', 'crops', 'tasks', 'field_technology', 'irrigation'],
  },
  barn: {
    enabledTabs: ['details', 'tasks'],
  },
  gate: {
    enabledTabs: ['details', 'tasks'],
  },
  water_valve: {
    enabledTabs: ['details', 'tasks'],
  },
  soil_sample_location: {
    enabledTabs: ['details', 'tasks'],
  },
  buffer_zone: {
    enabledTabs: ['details', 'crops', 'tasks', 'field_technology', 'irrigation'],
  },
  watercourse: {
    enabledTabs: ['details', 'tasks'],
  },
  fence: {
    enabledTabs: ['details', 'tasks'],
  },
  natural_area: {
    enabledTabs: ['details', 'tasks'],
  },
  residence: {
    enabledTabs: ['details', 'tasks'],
  },
  surface_water: {
    enabledTabs: ['details', 'tasks'],
  },
  ceremonial_area: {
    enabledTabs: ['details', 'tasks'],
  },
  farm_site_boundary: {
    enabledTabs: ['details', 'tasks', 'field_technology', 'irrigation'],
  },
};

export const allLocationTypes = Object.keys(locationRouteConfig);
