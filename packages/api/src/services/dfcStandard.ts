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

import { Connector } from '@datafoodconsortium/connector';
import { Enterprise, SocialMedia, Address } from '@datafoodconsortium/connector';
import type { MarketListingData } from './marketData.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createEnterpriseUrl = (farm_id: string): string => {
  return `https://api.app.litefarm.org/dfc/enterprise/${farm_id}`;
};

export const formatFarmDataToDfcStandard = async (farmListingData: MarketListingData) => {
  const connector = new Connector();

  // Load the taxonomy file
  await connector.loadProductTypes(
    await fs.readFile(path.join(__dirname, 'productTypes.json'), 'utf-8'),
  );

  const { farm_id, farm_name, country, farm_address, user } = farmListingData;

  const productCarrot = connector.createSuppliedProduct({
    semanticId: `${createEnterpriseUrl(farm_id)}#productCarrot`,
    productType: connector.PRODUCT_TYPES.VEGETABLE.CARROT,
  });

  const productVegetable = connector.createSuppliedProduct({
    semanticId: `${createEnterpriseUrl(farm_id)}#productVeg`,
    productType: connector.PRODUCT_TYPES.VEGETABLE,
  });

  const address = new Address({
    connector,
    semanticId: `${createEnterpriseUrl(farm_id)}#address`,
    street: farm_address.street,
    city: farm_address.city,
    region: farm_address.region,
    postalCode: farm_address.postalCode,
    country,
  });

  const mainContact = connector.createPerson({
    semanticId: `${createEnterpriseUrl(farm_id)}#person`,
    firstName: user.first_name,
    lastName: user.last_name,
  });

  const instagram = new SocialMedia({
    connector,
    semanticId: `${createEnterpriseUrl(farm_id)}#socialMedia-instagram`,
    name: 'Instagram',
    url: 'https://www.instagram.com/dfc_test_farm/',
  });

  const twitter = new SocialMedia({
    connector,
    semanticId: `${createEnterpriseUrl(farm_id)}#socialMedia-twitter`,
    name: 'Twitter',
    url: 'https://twitter.com/dfc_test_farm',
  });

  const farm = new Enterprise({
    connector,
    semanticId: createEnterpriseUrl(farm_id),
    name: farm_name,
    localizations: [address],
    mainContact,
    suppliedProducts: [productCarrot, productVegetable],
  });

  // setter methods on Agent.ts
  farm.addEmailAddress(user.email!);
  farm.addSocialMedia(instagram);
  farm.addSocialMedia(twitter);
  farm.addWebsite('https://www.dfc_test_farm.com');

  const exportFormattedData = await connector.export([
    farm,
    address,
    mainContact,
    instagram,
    twitter,
    productCarrot,
    productVegetable,
  ]);

  return exportFormattedData;
};
