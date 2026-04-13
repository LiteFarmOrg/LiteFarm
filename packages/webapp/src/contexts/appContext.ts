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

import { createContext, Dispatch, SetStateAction, useContext } from 'react';

export type DrawerName = 'feedbackSurvey' | 'farmNotes' | 'productForm' | 'profileMenu';

export type AppUIData = {
  activeDrawer: DrawerName | null;
  setActiveDrawer: Dispatch<SetStateAction<DrawerName | null>>;
  maps: {
    isLoaded: boolean;
  };
};

export const AppUIContext = createContext<AppUIData | null>(null);

export const useAppUIContext = () => {
  const AppUIData = useContext(AppUIContext);
  if (!AppUIData) {
    throw new Error('AppUIContext must be used within a provider');
  } else {
    return AppUIData;
  }
};
