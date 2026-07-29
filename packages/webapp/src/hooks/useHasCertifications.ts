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

import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import { useGetCertificationsQuery } from '../store/api/certificationsApi';

/**
 * Whether the farm holds any certification record, which is how the API decides a farm is
 * pursuing certification (see `organicCertifierCheck` on `PATCH /crop_variety/:id`). It
 * switches on the organic-compliance fields of the product forms.
 *
 * Only the admin roles hold `get:certification`, so the query is skipped for every other
 * role and returns false for them. LF-5411 tracks giving those roles an answer.
 */
export function useHasCertifications(): boolean {
  const isAdmin = useSelector(isAdminSelector);
  const { data: certifications = [] } = useGetCertificationsQuery(undefined, { skip: !isAdmin });

  return certifications.length > 0;
}
