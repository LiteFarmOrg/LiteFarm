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
import PurePartners from '../../components/AddSensors/Partners';
import { useGetFarmAddonQuery } from '../../store/api/apiSlice';
import { PARTNERS } from './constants';

const Partners = ({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { data: esciData = [] } = useGetFarmAddonQuery(`?addon_partner_id=${PARTNERS.ESCI.id}`);

  const hasActiveConnection = {
    esci: esciData.length > 0,
  };

  const allConnectionsActive = Object.values(hasActiveConnection).every(Boolean);

  setIsEditing(allConnectionsActive ? false : true);

  return <PurePartners hasActiveConnection={hasActiveConnection} />;
};

export default Partners;
