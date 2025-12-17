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

import { createContext, useContext, ReactNode } from 'react';
import { useGetFarmAddonQuery } from '../../../store/api/apiSlice';
import { PARTNERS } from '../../AddSensors/constants';

type FarmSettingsContextType = {
  showAddonsTab: boolean;
};

const FarmSettingsContext = createContext<FarmSettingsContextType | undefined>(undefined);

export const FarmSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: esciDataArray = [] } = useGetFarmAddonQuery(
    `?addon_partner_id=${PARTNERS.ESCI.id}`,
  );

  const hasActiveConnection = esciDataArray.length > 0;

  const value = {
    showAddonsTab: hasActiveConnection,
  };

  return <FarmSettingsContext.Provider value={value}>{children}</FarmSettingsContext.Provider>;
};

export const useFarmSettingsContext = () => {
  const context = useContext(FarmSettingsContext);
  if (!context) {
    throw new Error('useFarmSettingsContext must be used within a FarmSettingsProvider');
  }
  return context;
};
