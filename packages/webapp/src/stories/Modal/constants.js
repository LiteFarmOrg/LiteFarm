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

export const commonArgs = {
  history: {
    location: { pathname: '/crop/variety_id/management' },
  },
  match: {
    params: {
      variety_id: 'variety_id',
    },
  },
  variety: {
    crop_translation_key: 'Blueberry',
    crop_variety_name: 'Nantes',
    supplier: 'Buckerfields',
    crop_variety_photo_url:
      'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp',
  },
  dismissModal: () => console.log('dismiss'),
};

export const planBaseContents = {
  managementPlanName: 'Management Plan',
  locationName: 'Field 1',
  notes: 'Row 1',
  numberOfPendingTask: 0,
  status: 'active',
  management_plan_group_id: '97643f51-6105-4462-aa21-a5048117017f',
};
