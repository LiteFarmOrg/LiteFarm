/*
 *  Copyright 2025 LiteFarm.org
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

// Pass your real location object
export const mockField = {
  name: 'Second Field',
  location_id: 'dab87a46-0f41-11f0-9a54-acde48001122',
  type: 'field',
  grid_points: [
    {
      lat: 49.06326733965025,
      lng: -123.153402026469,
    },
    {
      lat: 49.06643065095024,
      lng: -123.15411012964893,
    },
    {
      lat: 49.06681023477433,
      lng: -123.15554779368091,
    },
    {
      lat: 49.06650094446976,
      lng: -123.15614860850025,
    },
    {
      lat: 49.06692270349866,
      lng: -123.15692108469653,
    },
    {
      lat: 49.06606512304573,
      lng: -123.1577793915813,
    },
    {
      lat: 49.06464516221381,
      lng: -123.15741461115527,
    },
  ],
};

// Pass pivot info; no need to make a location entity for it
export const mockPivot = {
  center: { lat: 49.06547, lng: -123.15597 },
  radius: 150,
};
