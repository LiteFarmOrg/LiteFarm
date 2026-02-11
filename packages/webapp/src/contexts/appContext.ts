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

import { createContext, Dispatch, RefObject, SetStateAction, useContext } from 'react';
import GoogleMap from 'google-map-react';

type GoogleMapType = typeof GoogleMap;

export type NavMenuControls = {
  feedback: {
    isFeedbackSurveyOpen: boolean;
    setFeedbackSurveyOpen: Dispatch<SetStateAction<boolean>>;
  };
};

export const NavMenuControlsContext = createContext<NavMenuControls | null>(null);

export const useNavMenuControls = () => {
  const NavMenuControls = useContext(NavMenuControlsContext);
  if (!NavMenuControls) {
    throw new Error('NavMenuControlsContext must be used within a provider');
  } else {
    return NavMenuControls;
  }
};

export type GoogleMapInstance = {
  instance: RefObject<GoogleMapType>;
  isLoaded: Boolean;
};

export const GoogleMapInstanceContext = createContext<GoogleMapInstance | null>(null);

export const useGoogleMapInstance = () => {
  const GoogleMapInstance = useContext(GoogleMapInstanceContext);
  if (!GoogleMapInstance) {
    throw new Error('GoogleMapInstanceContext must be used within a provider');
  } else {
    return GoogleMapInstance;
  }
};
