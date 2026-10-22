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
  };
  consentReducer?: { consent: UserConsent | null };
};

const compareVersions = (a: string, b: string) => {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const difference = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
};

const seedConsentFromUserFarms = (state: PersistedState): PersistedState => {
  const persisted = state as StateBeforeConsentSlice;
  if (persisted.consentReducer) {
    return state;
  }

  const { user_id, byFarmIdUserId = {} } = persisted.entitiesReducer?.userFarmReducer ?? {};
  const consentedVersions = user_id
    ? Object.values(byFarmIdUserId)
        .map((byUserId) => byUserId[user_id])
        .filter((row) => row?.has_consent && row.consent_version)
        .map((row) => row.consent_version as string)
        .sort(compareVersions)
    : [];
  const highestVersion = consentedVersions[consentedVersions.length - 1];

  return {
    ...persisted,
    consentReducer: {
      consent: highestVersion ? { consent_version: highestVersion, consented_at: null } : null,
    },
  } as PersistedState;
};

export const persistMigrations: MigrationManifest = {
  0: seedConsentFromUserFarms,
};
