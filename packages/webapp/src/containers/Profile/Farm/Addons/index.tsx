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
import PureFarmAddons from '../../../../components/Profile/Addons';
import { useGetFarmAddonQuery } from '../../../../store/api/apiSlice';
import { PARTNERS } from '../../../LocationDetails/PointDetails/SensorDetail/v2/constants';

const FarmAddons = () => {
  const { isSuccess: hasEsciConnection, data: EsciData } = useGetFarmAddonQuery(
    `?addon_partner_id=${PARTNERS.ESCI.id}`,
  );

  const hasActiveConnection = {
    esci: hasEsciConnection,
  };

  const [esciData] = EsciData || [];

  const organizationIds = {
    esci: esciData?.org_uuid,
  };

  const onDisconnect = {
    esci: () => {}, // TODO: LF-4701
  };

  const hasAnyActiveConnection = Object.values(hasActiveConnection).some(Boolean);

  return (
    hasAnyActiveConnection && (
      <PureFarmAddons
        hasActiveConnection={hasActiveConnection}
        organizationIds={organizationIds}
        onDisconnect={onDisconnect}
      />
    )
  );
};

export default FarmAddons;
