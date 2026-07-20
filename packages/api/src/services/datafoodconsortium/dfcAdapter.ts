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

import { promises as fs } from 'fs';
import path from 'path';
import {
  Connector,
  Organization,
  Certification,
  SKOSConcept,
  SocialMedia,
  Address,
  PhoneNumber,
  ISKOSConcept,
} from '@datafoodconsortium/connector';
import { apiUrl } from '../../util/environment.js';
import { parseGoogleGeocodedAddress } from '../../util/googleMaps.js';
import { convertCountryIso2ToIso3 } from '../../util/isoUtils.js';
import type {
  MarketDirectoryInfoWithRelations,
  MarketProductCategory,
} from '../../models/types.js';
import { CERTIFICATION_TYPES } from '../../models/certificationModel.js';
import { liteFarmToDFCTaxonomy, getNestedValue } from './litefarmToDFCTaxonomy.js';

let sharedProductTypesConnector: Connector;
let liteFarmKeyToDfcType: Map<string, ISKOSConcept>;
const __dirname = import.meta.dirname;

export const createEnterpriseUrl = (market_directory_info_id: string): string => {
  return `${apiUrl()}/dfc/enterprises/${market_directory_info_id}`;
};

type CertificationType = (typeof CERTIFICATION_TYPES)[number];

// certification_type enum values → official display names for DFC partners
const CERTIFICATION_TYPE_NAMES: Record<CertificationType, string> = {
  ORGANIC: 'Organic',
  BIODYNAMIC: 'Biodynamic',
  REGENERATIVE: 'Regenerative',
  CERTIFIED_HUMANE: 'Certified Humane',
  FAIR_TRADE: 'Fair Trade',
  'GRASSFED/PASTURE': 'Grassfed/Pasture',
  SUSTAINABILITY: 'Sustainability',
  ANIMAL_WELFARE: 'Animal Welfare',
  'NON-GMO': 'Non-GMO',
  'CARBON/CLIMATE': 'Carbon/Climate',
};

// Build and populate a lookup map: LiteFarm key → actual DFC product type object
const buildProductTypeMappings = (connector: Connector) => {
  const liteFarmKeyToDfcType = new Map<string, ISKOSConcept>();

  for (const [liteFarmKey, dfcPath] of Object.entries(liteFarmToDFCTaxonomy)) {
    if (typeof dfcPath === 'string') {
      const dfcType = getNestedValue(connector.PRODUCT_TYPES, dfcPath);
      if (dfcType) {
        liteFarmKeyToDfcType.set(liteFarmKey, dfcType);
      }
    }
  }

  return liteFarmKeyToDfcType;
};

export const formatFarmDataToDfcStandard = async (
  marketDirectoryInfo: MarketDirectoryInfoWithRelations,
  marketProductCategoryMap: Map<number, MarketProductCategory>,
) => {
  if (!sharedProductTypesConnector || !liteFarmKeyToDfcType) {
    let productTypesFile;
    try {
      productTypesFile = await fs.readFile(
        path.join(__dirname, '../../static/dfcProductTypes.json'),
        'utf-8',
      );
    } catch (err) {
      console.error(err);
      throw new Error('Failed to read taxonomy file');
    }

    sharedProductTypesConnector = new Connector();
    await sharedProductTypesConnector.loadProductTypes(productTypesFile);

    liteFarmKeyToDfcType = buildProductTypeMappings(sharedProductTypesConnector);
  }
  const connector = new Connector();

  const {
    id: market_directory_info_id,
    farm_name,
    about,
    logo,
    contact_first_name,
    contact_last_name,
    contact_email,
    address: addressString,
    country_code,
    phone_number,
    email,
    website,
    instagram,
    facebook,
    x,
    market_product_categories,
    certifications,
  } = marketDirectoryInfo;

  const parsedAddress = await parseGoogleGeocodedAddress(addressString);

  const enterpriseUrl = createEnterpriseUrl(market_directory_info_id);

  const countryIso3 = convertCountryIso2ToIso3(parsedAddress.countryCode);
  const dfcCountryUri = countryIso3
    ? `http://publications.europa.eu/resource/authority/country/${countryIso3}`
    : parsedAddress.country; // fallback to country name if ISO conversion fails

  const countryConceptUri = dfcCountryUri
    ? new SKOSConcept({ connector, semanticId: dfcCountryUri, doNotStore: true })
    : undefined;

  const address = new Address({
    connector,
    semanticId: `${enterpriseUrl}#address`,
    street: parsedAddress.street,
    city: parsedAddress.city,
    region: parsedAddress.region,
    postalCode: parsedAddress.postalCode,
    country: countryConceptUri,
  });

  const mainContact = connector.createPerson({
    semanticId: `${enterpriseUrl}#person-mainContact`,
    firstName: contact_first_name,
    lastName: contact_last_name ?? undefined,
  });

  /* @ts-expect-error addEmailAddress is on Agent but not exposed on IPerson interface */
  mainContact.addEmailAddress(contact_email);

  const products = (market_product_categories ?? [])
    .map(({ market_product_category_id }) => {
      const category = marketProductCategoryMap.get(market_product_category_id);
      if (!category) return null;

      const dfcProductType = liteFarmKeyToDfcType.get(category.key);

      return connector.createSuppliedProduct({
        semanticId: `${enterpriseUrl}#suppliedProduct-${category.key.toLowerCase()}`,
        productType: dfcProductType,
      });
    })
    .filter((product): product is NonNullable<typeof product> => product !== null);

  const farm = new Organization({
    connector,
    semanticId: enterpriseUrl,
    name: farm_name,
    description: about ?? undefined,
    logo: logo ?? undefined,
    mainContact,
    localizations: [address],
    suppliedProducts: products,
  });

  const certificationInstances = (certifications ?? [])
    .filter((cert) => cert.is_active && cert.certification_type)
    .map(
      (cert) =>
        new Certification({
          connector,
          semanticId: `${enterpriseUrl}#certification-${cert.id}`,
          // Fall back to the raw enum value if a new type is missing from the map
          name:
            CERTIFICATION_TYPE_NAMES[cert.certification_type as CertificationType] ??
            cert.certification_type!,
          description: undefined,
          certificationReferences: cert.certifier?.certifier_name
            ? [cert.certifier.certifier_name]
            : [cert.other_certifier!],
          operatorIds: cert.certificate_member_id ? [cert.certificate_member_id] : [],
          certificationScores: [],
        }),
    );
  certificationInstances.forEach((cert) => farm.addCertification(cert));

  let phoneNumber;
  if (phone_number) {
    phoneNumber = new PhoneNumber({
      connector,
      semanticId: `${enterpriseUrl}#phoneNumber`,
    });
    phoneNumber.setNumber(phone_number);

    if (country_code) {
      phoneNumber.setCountryCode(country_code);
    }

    farm.addPhoneNumber(phoneNumber);
  }

  if (email) {
    farm.addEmailAddress(email);
  }

  if (website) {
    farm.addWebsite(website);
  }

  const socialMediaInstances = [];

  if (instagram) {
    const instagramInstance = new SocialMedia({
      connector,
      semanticId: `${enterpriseUrl}#socialMedia-instagram`,
      name: 'Instagram',
      url: `https://www.instagram.com/${instagram}/`,
    });
    farm.addSocialMedia(instagramInstance);
    socialMediaInstances.push(instagramInstance);
  }

  if (facebook) {
    const facebookInstance = new SocialMedia({
      connector,
      semanticId: `${enterpriseUrl}#socialMedia-facebook`,
      name: 'Facebook',
      url: `https://www.facebook.com/${facebook}/`,
    });
    farm.addSocialMedia(facebookInstance);
    socialMediaInstances.push(facebookInstance);
  }

  if (x) {
    const xInstance = new SocialMedia({
      connector,
      semanticId: `${enterpriseUrl}#socialMedia-x`,
      name: 'X',
      url: `https://x.com/${x}/`,
    });
    farm.addSocialMedia(xInstance);
    socialMediaInstances.push(xInstance);
  }

  const exportFormattedData = await connector.export([
    farm,
    address,
    mainContact,
    ...(phoneNumber ? [phoneNumber] : []),
    ...socialMediaInstances,
    ...products,
    ...certificationInstances,
  ]);

  return JSON.parse(exportFormattedData);
};
