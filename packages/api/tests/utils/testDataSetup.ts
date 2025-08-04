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

import knex from '../../src/util/knex.js';
import mocks from '../mock.factories.js';
import LocationModel from '../../src/models/locationModel.js';
import { Farm, Location, User } from '../../src/models/types.js';

/**
 * Generates a fake user farm object with the specified role.
 */
export function fakeUserFarm(role: number = 1) {
  return { ...mocks.fakeUserFarm(), role_id: role };
}

/**
 * Creates a farm and a user, then associates them using the given role.
 */
export async function returnUserFarms(role: number): Promise<{ mainFarm: Farm; user: User }> {
  const [mainFarm] = await mocks.farmFactory();
  const [user] = await mocks.usersFactory();

  await mocks.userFarmFactory(
    {
      promisedUser: Promise.resolve([user]),
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
        promisedUser: Promise.resolve([nonOwnerUser]),
        promisedFarm: Promise.resolve([farm]),
      },
      fakeUserFarm(role),
    );
    user = nonOwnerUser;
  }

  const field = await createField(farm);

  return { owner, farm, field, user };
}

/**
 * Sets up two crop management plans (one seed and one transplant) for the provided farm environment.
 */
export async function setupManagementPlans({ farm, field }: { farm: Farm; field: Location }) {
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

/**
 * Creates a field for an existing farm and returns the location with field data
 */
export async function createField(farm: Farm) {
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

  return field;
}

export const setupSoilAmendmentTaskDependencies = async ({
  farmId,
  taskId,
  soilAmendmentTaskProductData = {},
}: {
  farmId: string;
  taskId: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  soilAmendmentTaskProductData: { [key: string]: any };
}) => {
  const [product] = await mocks.productFactory(
    { promisedFarm: Promise.resolve([{ farm_id: farmId }]) },
    mocks.fakeProduct({ type: 'soil_amendment_task' }),
  );
  // Make product details available
  await mocks.soil_amendment_productFactory({
    promisedProduct: Promise.resolve([product]),
  });

  const [soilAmendmentPurpose] = await mocks.soil_amendment_purposeFactory();

  const fakeSoilAmendmentTaskProduct = mocks.fakeSoilAmendmentTaskProduct({
    product_id: product.product_id,
    ...soilAmendmentTaskProductData,
  });

  const [soilAmendmentTaskProduct] = await mocks.soil_amendment_task_productsFactory(
    { promisedTask: Promise.resolve([{ task_id: taskId }]) },
    fakeSoilAmendmentTaskProduct,
  );

  const soilAmendmentProduct = await knex('soil_amendment_product')
    .where({ product_id: product.product_id })
    .first();

  const [soilAmendmentTaskProductsPurposeRelationship] = await knex(
    'soil_amendment_task_products_purpose_relationship',
  )
    .insert({ task_products_id: soilAmendmentTaskProduct.id, purpose_id: soilAmendmentPurpose.id })
    .returning('*');

  return {
    soilAmendmentProduct,
    soilAmendmentTaskProduct,
    soilAmendmentTaskProductsPurposeRelationship,
  };
};
