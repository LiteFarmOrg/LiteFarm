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

export type CertificationStatus = 'active' | 'expiring_soon' | 'expired' | 'pursuing';

export type SystemType = 'third_party' | 'pgs';

export type CertificationItem = {
  id: string;
  certificationSystemType: string;
  systemType: SystemType;
  certifierName: string;
  certificationIdentifier?: string | null;
  isActive: boolean;
  expiryDate?: string | null;
  documentFileName?: string | null;
};
