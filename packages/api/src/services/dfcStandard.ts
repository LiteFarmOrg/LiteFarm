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
import { parseGoogleGeocodedAddress } from '../util/googleMaps.js';
import type { MarketDirectoryInfo } from '../models/types.js';

const createEnterpriseUrl = (market_directory_info_id: string): string => {
  return `https://api.app.litefarm.org/dfc/enterprise/${market_directory_info_id}`;
};

export const formatFarmDataToDfcStandard = async (marketDirectoryInfo: MarketDirectoryInfo) => {
  const connector = new Connector();

  const {
    id: market_directory_info_id,
    farm_id,
    farm_name,
    address: addressString,
    contact_first_name,
    contact_last_name,
    contact_email,
    email,
    website,
    instagram,
    facebook,
    x,
  } = marketDirectoryInfo;

  const parsedAddress = await parseGoogleGeocodedAddress(addressString);

  const address = new Address({
    connector,
    semanticId: `${createEnterpriseUrl(market_directory_info_id)}#address`,
    street: parsedAddress.street,
    city: parsedAddress.city,
    region: parsedAddress.region,
    postalCode: parsedAddress.postalCode,
    country: parsedAddress.country,
  });

  const mainContact = connector.createPerson({
    semanticId: `${createEnterpriseUrl(market_directory_info_id)}#person-mainContact`,
    firstName: contact_first_name,
    lastName: contact_last_name,
  });

  /* @ts-expect-error incorrect interface type */
  mainContact.addEmailAddress(contact_email);

  const farm = new Enterprise({
    connector,
    semanticId: createEnterpriseUrl(market_directory_info_id),
    name: farm_name,
    localizations: [address],
    mainContact,
  });
  const socialMediaInstances = [];

  if (instagram) {
    const instagramInstance = new SocialMedia({
      connector,
      semanticId: `${createEnterpriseUrl(farm_id)}#socialMedia-instagram`,
      name: 'Instagram',
      url: `https://www.instgram.com/${instagram}`,
    });
    farm.addSocialMedia(instagramInstance);
    socialMediaInstances.push(instagramInstance);
  }

  if (facebook) {
    const facebookInstance = new SocialMedia({
      connector,
      semanticId: `${createEnterpriseUrl(farm_id)}#socialMedia-facebook`,
      name: 'Facebook',
      url: `https://www.facebook.com/${facebook}`,
    });
    farm.addSocialMedia(facebookInstance);
    socialMediaInstances.push(facebookInstance);
  }

  if (x) {
    const xInstance = new SocialMedia({
      connector,
      semanticId: `${createEnterpriseUrl(farm_id)}#socialMedia-x`,
      name: 'X',
      url: `https://x.com/${x}`,
    });
    farm.addSocialMedia(xInstance);
    socialMediaInstances.push(xInstance);
  }

  if (email) {
    farm.addEmailAddress(email);
  }

  if (website) {
    farm.addWebsite(website);
  }

  const exportFormattedData = await connector.export([
    farm,
    address,
    mainContact,
    ...socialMediaInstances,
  ]);

  return exportFormattedData;
};
