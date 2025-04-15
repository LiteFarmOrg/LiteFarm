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

import mocks from '../mock.factories.js';
import LocationModel from '../../src/models/locationModel.js';

export interface User {
  user_id: string;
}

export interface Farm {
  farm_id: string;
}

export interface FarmEnvironment {
  farm: Farm;
  field: Record<string, unknown>;
}
/**
 * Generates a fake user farm object with the specified role.
 */
export function fakeUserFarm(role: number = 1) {
  return { ...mocks.fakeUserFarm(), role_id: role };
}

/**
 * Creates a farm and a user, then associates them using the given role.
 */
export async function returnUserFarms(role: number) {
  const [mainFarm] = await mocks.farmFactory();
  const [user] = await mocks.usersFactory();

  await mocks.userFarmFactory(
    {
      promisedUser: [user],
      promisedFarm: Promise.resolve([mainFarm]),
    },
    fakeUserFarm(role),
  );
  return { mainFarm, user };
}

/**
 * Sets up the farm environment by creating a farm, owner, field, and (optionally) a non-owner user (if role id is provided)
 */
export async function setupFarmEnvironment(role: number = 1) {
  const { mainFarm: farm, user: owner } = await returnUserFarms(1);

  let user = owner;
  if (role !== 1) {
    const [nonOwnerUser] = await mocks.usersFactory();
    await mocks.userFarmFactory(
      {
        promisedUser: [nonOwnerUser],
        promisedFarm: Promise.resolve([farm]),
      },
      fakeUserFarm(role),
    );
    user = nonOwnerUser;
  }

  const [location] = await mocks.locationFactory({ promisedFarm: Promise.resolve([farm]) });

  await mocks.fieldFactory({
    promisedLocation: Promise.resolve([location]),
  });

  const field = await LocationModel
    /* @ts-expect-error don't know how to fix */
    .query()
    .context({ showHidden: true })
    .whereNotDeleted()
    .findById(location.location_id).withGraphFetched(`[
        figure.[area], field
      ]`);
  return { owner, farm, field, user };
}

/**
 * Sets up two crop management plans (one seed and one transplant) for the provided farm environment.
 */
export async function setupManagementPlans({ farm, field }: FarmEnvironment) {
  const [crop] = await mocks.cropFactory(
    { promisedFarm: Promise.resolve([farm]) },
    {
      ...mocks.fakeCrop(),
      crop_common_name: 'crop',
      user_added: true,
    },
  );
  const [cropVariety] = await mocks.crop_varietyFactory({
    promisedFarm: Promise.resolve([farm]),
    promisedCrop: Promise.resolve([crop]),
  });
  const [transplantManagementPlan] = await mocks.crop_management_planFactory(
    {
      promisedField: Promise.resolve([field]),
      promisedCropVariety: Promise.resolve([cropVariety]),
    },
    {
      cropManagementPlan: {
        ...mocks.fakeCropManagementPlan(),
        needs_transplant: true,
      },
    },
  );
  const [seedManagementPlan] = await mocks.crop_management_planFactory(
    {
      promisedField: Promise.resolve([field]),
      promisedCropVariety: Promise.resolve([cropVariety]),
    },
    {
      cropManagementPlan: {
        ...mocks.fakeCropManagementPlan(),
        needs_transplant: false,
      },
    },
  );

  return {
    crop,
    cropVariety,
    transplantManagementPlan,
    seedManagementPlan,
  };
}
