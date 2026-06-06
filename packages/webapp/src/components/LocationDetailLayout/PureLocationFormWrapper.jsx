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
import { getDateInputFormat } from '../../util/moment';

const getOrganicStatusDefaultValues = (persistedFormData) => {
  return {
    organic_status: 'Non-Organic',
    ...persistedFormData,
    transition_date: getDateInputFormat(persistedFormData['transition_date'] || new Date()),
  };
};

const getAreaConfig = (persistedFormData) => ({
  barn: {
    showPerimeter: false,
    defaultValues: persistedFormData,
  },
  ceremonial_area: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
  farm_site_boundary: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
  field: {
    showPerimeter: true,
    defaultValues: getOrganicStatusDefaultValues(persistedFormData),
  },
  garden: {
    showPerimeter: true,
    defaultValues: getOrganicStatusDefaultValues(persistedFormData),
  },
  greenhouse: {
    showPerimeter: false,
    defaultValues: getOrganicStatusDefaultValues(persistedFormData),
  },
  natural_area: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
  residence: {
    showPerimeter: false,
    defaultValues: persistedFormData,
  },
  surface_water: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
});

export default function PureLocationFormWrapper({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage = false,
  isViewLocationPage = false,
  isEditLocationPage = false,
  persistedFormData,
  useHookFormPersist = () => {},
  handleRetire = () => {},
  isAdmin = false,
  locationType,
}) {
  const onSubmit = (data) => {
    // area units lift value up to top level
    if (getFigureType(locationType) === 'area') {
      data[`total_area_unit`] = data[`total_area_unit`]?.value;
      data[`perimeter_unit`] = data[`perimeter_unit`]?.value;
    }
    if (getFigureType(locationType) === 'line') {
      data[`length_unit`] = data[`length_unit`]?.value;
      data[`width_unit`] = data[`width_unit`]?.value;
      data['total_area_unit'] = data['total_area_unit']?.value;
      if (locationType === 'watercourse') {
        data['buffer_width_unit'] = data['buffer_width_unit']?.value;
      }
      if (locationType === 'fence') {
        data['width'] = 0;
        delete data['total_area_unit'];
      }
    }
    if (getFigureType(locationType) === 'point') {
      if (locationType === 'water_valve') {
        data['flow_rate_unit'] = data['flow_rate_unit']?.value;
      }
    }

    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: locationType,
    });

    submitForm({ formData });
  };

  const DetailsChildren = ExtraLocationFormFieldsMap[locationType] || undefined;
  const areaConfig = getAreaConfig(persistedFormData)[locationType] || {};
  const figureType = getFigureType(locationType);

  return (
    <PersistedFormWrapper>
      <PureLocationDetailLayout
        history={history}
        match={match}
        system={system}
        locationType={locationType}
        locationCategory={figureType}
        isCreateLocationPage={isCreateLocationPage}
        isEditLocationPage={isEditLocationPage}
        isViewLocationPage={isViewLocationPage}
        persistedFormData={figureType === 'area' ? areaConfig.defaultValues : persistedFormData}
        useHookFormPersist={useHookFormPersist}
        handleRetire={handleRetire}
        isAdmin={isAdmin}
        onSubmit={onSubmit}
        translationKey={locationType.toUpperCase()}
        detailsChildren={
          DetailsChildren ? (
            <DetailsChildren
              system={system}
              isViewLocationPage={isViewLocationPage}
              isEditLocationPage={isEditLocationPage}
              // persisted form data only used in soil sample location
              persistedFormData={persistedFormData}
            />
          ) : undefined
        }
        showPerimeter={figureType === 'area' ? areaConfig.showPerimeter : undefined}
      />
    </PersistedFormWrapper>
  );
}
