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

import { PersistedFormWrapper } from './PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from './PureLocationDetailLayout';
import ExtraLocationFormFieldsMap from './ExtraFormFieldsMap';
import { getFigureType } from '../../containers/LocationDetails/utils';

export default function PureLocationFormWrapper({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
  locationType,
}) {
  const onSubmit = (data) => {
    // area units lift value up to top level
    data[`total_area_unit`] = data[`total_area_unit`]?.value;
    data[`perimeter_unit`] = data[`perimeter_unit`]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: locationType,
    });

    submitForm({ formData });
  };

  const DetailsChildren = ExtraLocationFormFieldsMap[locationType];

  return (
    <PersistedFormWrapper>
      <PureLocationDetailLayout
        history={history}
        match={match}
        system={system}
        locationType={locationType}
        locationCategory={getFigureType(locationType)}
        isCreateLocationPage={isCreateLocationPage}
        isEditLocationPage={isEditLocationPage}
        isViewLocationPage={isViewLocationPage}
        persistedFormData={persistedFormData}
        useHookFormPersist={useHookFormPersist}
        handleRetire={handleRetire}
        isAdmin={isAdmin}
        onSubmit={onSubmit}
        translationKey={locationType.toUpperCase()}
        detailsChildren={<DetailsChildren isViewLocationPage={isViewLocationPage} />}
        showPerimeter={false}
      />
    </PersistedFormWrapper>
  );
}
