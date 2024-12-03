import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../Form/Button';
import LocationPicker from '../../LocationPicker/SingleLocationPicker';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { cloneObject } from '../../../util';
import Checkbox from '../../Form/Checkbox';
import AnimalInventory, { View } from '../../../containers/Animals/Inventory';
import styles from './styles.module.scss';
import clsx from 'clsx';
export default function PureTaskLocations({
  locations,
  readOnlyPinCoordinates,
  onContinue,
  onGoBack,
  farmCenterCoordinate,
  persistedFormData,
  useHookFormPersist,
  isMulti = true,
  title,
  maxZoomRef,
  getMaxZoom,
  maxZoom,
  defaultLocation,
  targetsWildCrop,
  isAnimalTask = false,
}) {
  const { t } = useTranslation();
  const progress = 43;
  const defaultLocations = useMemo(() => {
    const locationIdsSet = new Set(locations.map(({ location_id }) => location_id));
    if (isMulti) {
      return (
        persistedFormData.locations?.filter(({ location_id }) => locationIdsSet.has(location_id)) ||
        []
      );
    } else {
      const location = persistedFormData.locations?.find(({ location_id }) =>
        locationIdsSet.has(location_id),
      );
      return location ? [location] : [];
    }
  }, []);
  const { getValues, watch, setValue, register } = useForm({
    defaultValues: cloneObject({ ...persistedFormData, locations: defaultLocations }),
    shouldUnregister: false,
  });
  const { historyCancel } = useHookFormPersist(getValues);
  const SHOW_WILD_CROP = 'show_wild_crop';
  const show_wild_crop = watch(SHOW_WILD_CROP);
  const LOCATIONS = 'locations';
  const selectedLocations = watch(LOCATIONS);
  const selectedLocationIds = useMemo(
    () => selectedLocations?.map(({ location_id }) => location_id),
    [selectedLocations],
  );

  const onSelectLocation = (location_id) => {
    if (!isMulti) {
      if (getValues('show_wild_crop')) {
        setValue(SHOW_WILD_CROP, false);
      }
      if (selectedLocations[0]?.location_id === location_id) {
        setValue(LOCATIONS, []);
        return;
      }
    }
    setValue(
      LOCATIONS,
      isMulti ? getSelectedLocations(location_id, selectedLocations) : [{ location_id }],
    );
  };

  useEffect(() => {
    !selectedLocations?.length &&
      defaultLocation &&
      locations.some((location) => location.location_id === defaultLocation.location_id) &&
      onSelectLocation(defaultLocation.location_id);
  }, [defaultLocation]);

  useEffect(() => {
    setValue(SHOW_WILD_CROP, targetsWildCrop);
  }, []);

  const onChange = (e) => {
    if (!isMulti && e.target.checked) {
      clearLocations();
    }
  };

  const getSelectedLocations = (location_id, selectedLocations) => {
    const isSelected = selectedLocations
      .map((location) => location.location_id)
      .includes(location_id);
    return isSelected
      ? selectedLocations.filter((location) => location.location_id !== location_id)
      : [...selectedLocations, { location_id }];
  };

  const clearLocations = () => setValue(LOCATIONS, []);

  const showWildCropCheckBox = !!readOnlyPinCoordinates?.length;

  return (
    <>
      <Layout
        buttonGroup={
          <>
            <Button
              data-cy="addTask-locationContinue"
              disabled={!selectedLocations?.length && !(showWildCropCheckBox && show_wild_crop)}
              onClick={() => onContinue(getValues())}
              fullLength
            >
              {t('common:CONTINUE')}
            </Button>
          </>
        }
        fullWidthContent={isAnimalTask}
      >
        <MultiStepPageTitle
          onGoBack={onGoBack}
          onCancel={historyCancel}
          cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
          title={t('MANAGEMENT_DETAIL.ADD_A_TASK')}
          value={progress}
          classes={{ container: isAnimalTask ? styles.titlePadding : null }}
        />
        {isAnimalTask && (
          <div className={styles.animalInventoryWrapper}>
            <AnimalInventory
              view={View.TASK_SUMMARY}
              preSelectedIds={persistedFormData?.animalIds}
              showLinks={false}
              showOnlySelected={true}
            />
          </div>
        )}
        <Main className={clsx(styles.locationPickerText, isAnimalTask && styles.fullWidthPadding)}>
          {title || t('TASK.SELECT_TASK_LOCATIONS')}
        </Main>
        <LocationPicker
          onSelectLocation={onSelectLocation}
          clearLocations={clearLocations}
          selectedLocationIds={selectedLocationIds}
          locations={locations}
          farmCenterCoordinate={farmCenterCoordinate}
          readOnlyPinCoordinates={readOnlyPinCoordinates}
          maxZoomRef={maxZoomRef}
          getMaxZoom={getMaxZoom}
          maxZoom={maxZoom}
          style={isAnimalTask ? { marginLeft: '24px', marginRight: '24px' } : null}
        />
        {showWildCropCheckBox && (
          <Checkbox
            label={t('TASK.SELECT_WILD_CROP')}
            style={{ paddingBottom: '25px' }}
            hookFormRegister={register(SHOW_WILD_CROP)}
            onChange={onChange}
          />
        )}
      </Layout>
    </>
  );
}

PureTaskLocations.propTypes = {
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  storedLocations: PropTypes.array,
  locations: PropTypes.arrayOf(PropTypes.object),
  farmCenterCoordinate: PropTypes.object,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  isMulti: PropTypes.bool,
  title: PropTypes.string,
  readOnlyPinCoordinates: PropTypes.array,
  maxZoomRef: PropTypes.object,
  getMaxZoom: PropTypes.func,
  targetsWildCrop: PropTypes.bool,
};
