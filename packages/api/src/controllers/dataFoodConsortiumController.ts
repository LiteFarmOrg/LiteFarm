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

import { Request, Response } from 'express';
import { formatFarmDataToDfcStandard } from '../services/datafoodconsortium/dfcAdapter.js';
import MarketDirectoryInfo from '../models/marketDirectoryInfoModel.js';
import type { HttpError } from '../types.js';
import MarketDirectoryPartnerPermissions from '../models/marketDirectoryPartnerPermissions.js';
import type {
  MarketDirectoryPartnerPermissions as MarketDirectoryPartnerPermissionsType,
  MarketDirectoryInfo as MarketDirectoryInfoType,
} from '../models/types.js';
import MarketProductCategoryModel from '../models/marketProductCategoryModel.js';
import { apiUrl } from '../util/environment.js';

interface DfcGraphEntity {
  '@type': string;
  '@id': string;
  [key: string]: unknown;
}

interface DfcDocument {
  '@context': string;
  '@graph': DfcGraphEntity[];
}

const dataFoodConsortiumController = {
  getDfcEnterprise() {
    return async (req: Request, res: Response) => {
      const { id } = req.params;

      try {
        const marketDirectoryInfo = await MarketDirectoryInfo
          /* @ts-expect-error known issue with models */
          .query()
          .findById(id)
          .withGraphFetched({
            market_product_categories: true,
          });

        const marketProductCategoryMap = await MarketProductCategoryModel.getLookupMap();
        const dfcFormattedListingData = await formatFarmDataToDfcStandard(
          marketDirectoryInfo,
          marketProductCategoryMap,
        );

        return res
          .status(200)
          .set('Content-Type', 'application/ld+json; profile="dfc-v2"')
          .send(JSON.stringify(dfcFormattedListingData));
      } catch (error: unknown) {
        console.error(error);

        const err = error as HttpError;
        const status = err.status || err.code || 500;
        return res.status(status).json({
          error: err.message || err,
        });
      }
    };
  },

  getAllClientEnterprises() {
    return async (_req: Request, res: Response) => {
      const { marketDirectoryPartnerId } = res.locals;

      try {
        const authorizedFarms: MarketDirectoryPartnerPermissionsType[] =
          await MarketDirectoryPartnerPermissions
            /* @ts-expect-error known issue with models */
            .query()
            .where({ market_directory_partner_id: marketDirectoryPartnerId })
            .select('market_directory_info_id')
            .whereNotDeleted();

        const authorizedFarmsDirectoryInfo: MarketDirectoryInfoType[] = await MarketDirectoryInfo
          /* @ts-expect-errors known issue with models */
          .query()
          .whereIn(
            'id',
            authorizedFarms.map(({ market_directory_info_id }) => market_directory_info_id),
          )
          .withGraphFetched({
            market_product_categories: true,
          });

        let data = {};

        if (authorizedFarmsDirectoryInfo.length) {
          const enterpriseUrls = [];
          const marketProductCategoryMap = await MarketProductCategoryModel.getLookupMap();

          const dfcFormattedListingData = [];
          for (const marketDirectoryInfo of authorizedFarmsDirectoryInfo) {
            const formatted: DfcDocument = await formatFarmDataToDfcStandard(
              marketDirectoryInfo,
              marketProductCategoryMap,
            );
            enterpriseUrls.push(
              formatted['@graph'].find((entity) => entity['@type'] === 'dfc-b:Organization')?.[
                '@id'
              ],
            );
            dfcFormattedListingData.push(formatted);
          }

          const mergedGraph = [
            {
              '@id': `${apiUrl()}/dfc/enterprises`,
              '@type': 'ldp:Container',
              'ldp:contains': enterpriseUrls,
            },
            ...dfcFormattedListingData.flatMap((doc) => doc['@graph']),
          ];

          data = {
            '@context': dfcFormattedListingData[0]?.['@context'],
            '@graph': mergedGraph,
          };
        }

        return res
          .status(200)
          .set('Content-Type', 'application/ld+json; profile="dfc-v2"')
          .send(JSON.stringify(data));
      } catch (error: unknown) {
        console.error(error);

        const err = error as HttpError;
        const status = err.status || err.code || 500;
        return res.status(status).json({
          error: err.message || err,
        });
      }
    };
  },
};

export default dataFoodConsortiumController;
