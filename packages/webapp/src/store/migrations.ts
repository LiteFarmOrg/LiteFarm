/*
 *  Copyright 2026 LiteFarm.org
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

import type { MigrationManifest, PersistedState } from 'redux-persist';
import type { UserConsent } from '../containers/consentSlice';
import { CONSENT_VERSION } from '../util/constants';

interface PersistedUserFarm {
  has_consent?: boolean | null;
  consent_version?: string | null;
}

type StateBeforeConsentSlice = PersistedState & {
  entitiesReducer?: {
    userFarmReducer?: {
      user_id?: string;
      byFarmIdUserId?: Record<string, Record<string, PersistedUserFarm>>;
    };
    consentReducer?: { consent: UserConsent | null };
  };
};

const seedConsentFromUserFarms = (state: PersistedState): PersistedState => {
  const persisted = state as StateBeforeConsentSlice;
  const entities = persisted.entitiesReducer;
  if (!entities || entities.consentReducer) {
    return state;
  }

  const { user_id, byFarmIdUserId = {} } = entities.userFarmReducer ?? {};
  const hasConsented =
    !!user_id &&
    Object.values(byFarmIdUserId).some(
      (byUserId) =>
        byUserId[user_id]?.has_consent && byUserId[user_id]?.consent_version === CONSENT_VERSION,
    );

  return {
    ...persisted,
    entitiesReducer: {
      ...entities,
      consentReducer: {
        consent: hasConsented ? { consent_version: CONSENT_VERSION, consented_at: null } : null,
      },
    },
  } as PersistedState;
};

export const persistMigrations: MigrationManifest = {
  0: seedConsentFromUserFarms,
};
