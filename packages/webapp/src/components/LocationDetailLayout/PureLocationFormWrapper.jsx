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

import {
  LabeledRadioRow,
  OrganicTypeSelector,
  PersistedFormWrapper,
  UnitField,
} from './LocationFormUtils';
import Input from '../Form/Input';
import { getFormDataWithoutNulls } from '../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from './PureLocationDetailLayout';
import { getFigureType } from '../../containers/LocationDetails/utils';
import { getAreaConfig, locationsSpecificFormFields } from './config';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

function getLocationSpecificFormFields({
  locationType,
  system,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
}) {
  const config = locationsSpecificFormFields({
    isEditLocationPage,
    isViewLocationPage,
    persistedFormData,
  })[locationType];
  if (!config) return null;
  const { t } = useTranslation();
  return (
    <>
      {...config.sections.map((section, index) => (
        <div key={index} className={styles.sectionPadding}>
          {section.orderedInputs.map((input) => {
            if (input.inputType === 'radio') {
              return (
                <LabeledRadioRow
                  key={input.name}
                  label={t(input.labelKey)}
                  name={input.name}
                  isViewLocationPage={isViewLocationPage}
                  hasLeaf={input.hasLeaf}
                  radios={input.radios}
                />
              );
            } else if (input.inputType === 'OrganicTypeSelector') {
              return (
                <OrganicTypeSelector
                  key={input.inputType}
                  enumKeys={input.enumKeys}
                  labelKey={input.labelKey}
                  isViewLocationPage={isViewLocationPage}
                />
              );
            } else if (input.inputType === 'UnitField') {
              return (
                <UnitField
                  key={input.name}
                  enumKey={input.name}
                  label={t(input.labelKey)}
                  unitType={input.unitType}
                  displayUnitName={input.displayUnitName}
                  system={system}
                  required={input.required}
                  disabled={input.disabled}
                />
              );
            } else if (input.inputType === 'InputRow') {
              return (
                <div className={styles.rowInputContainer} key={input.name}>
                  {input.rowInputs.map((rowInput) => (
                    <Input
                      key={rowInput.name}
                      label={t(rowInput.labelKey)}
                      disabled={rowInput.disabled}
                      value={rowInput.value}
                    />
                  ))}
                </div>
              );
            }
            // Add other input types as needed
            return null;
          })}
        </div>
      ))}
    </>
  );
}

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

  const LocationSpecificFormFields = () =>
    getLocationSpecificFormFields({
      locationType,
      system,
      isEditLocationPage,
      isViewLocationPage,
      persistedFormData,
    }) || undefined;
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
          LocationSpecificFormFields ? (
            <LocationSpecificFormFields
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
