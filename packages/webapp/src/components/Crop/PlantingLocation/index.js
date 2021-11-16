import styles from './styles.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../Form/Button';
import LocationPicker from '../../LocationPicker/SingleLocationPicker';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { ReactComponent as Cross } from '../../../assets/images/map/cross.svg';
import { ReactComponent as LocationPin } from '../../../assets/images/map/location.svg';
import Checkbox from '../../Form/Checkbox';
import { useForm } from 'react-hook-form';
import { cloneObject } from '../../../util';
import { getPlantingLocationPaths } from '../getAddManagementPlanPath';

export default function PurePlantingLocation({
  persistedFormData,
  useHookFormPersist,
  isFinalLocationPage,
  variety_id,
  history,
  cropLocations,
  default_initial_location_id,
  farmCenterCoordinate,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);
  const { getValues, watch, setValue } = useForm({
    defaultValues: cloneObject(persistedFormData),
    shouldUnregister: false,
  });
  useHookFormPersist(getValues);

  const {
    crop_management_plan: { needs_transplant, is_seed, is_wild, already_in_ground },
  } = persistedFormData;
  const showInitialLocationCheckbox = !isFinalLocationPage;
  const showPinButton = already_in_ground && is_wild && (!isFinalLocationPage || !needs_transplant);
  useEffect(() => {
    if (!already_in_ground || !is_wild) {
      setPinLocation(undefined);
    }
  }, []);

  const locationPrefix = isFinalLocationPage ? 'final' : 'initial';
  const LOCATION_ID = `crop_management_plan.planting_management_plans.${locationPrefix}.location_id`;
  const PIN_COORDINATE = `crop_management_plan.planting_management_plans.${locationPrefix}.pin_coordinate`;
  const DEFAULT_INITIAL_LOCATION_ID = 'farm.default_initial_location_id';

  const selectedLocationId = watch(LOCATION_ID);
  const pinCoordinate = watch(PIN_COORDINATE);
  const defaultInitialLocationId = watch(DEFAULT_INITIAL_LOCATION_ID);

  const setLocationId = (location_id) => {
    if (selectedLocationId === location_id) {
      setValue(LOCATION_ID, null);
    } else {
      setValue(LOCATION_ID, location_id);
    }
    if (showInitialLocationCheckbox && defaultInitialLocationId) {
      setValue(DEFAULT_INITIAL_LOCATION_ID, location_id);
    }
  };
  useEffect(() => {
    if (!(already_in_ground && is_wild) && !isFinalLocationPage && !selectedLocationId) {
      setLocationId(default_initial_location_id);
      setValue(DEFAULT_INITIAL_LOCATION_ID, default_initial_location_id);
    }
  }, []);

  const setPinLocation = (coordinate) => setValue(PIN_COORDINATE, coordinate);
  const defaultLocationCheckboxOnChange = () => {
    if (defaultInitialLocationId) {
      setValue(DEFAULT_INITIAL_LOCATION_ID, undefined);
    } else {
      setValue(DEFAULT_INITIAL_LOCATION_ID, selectedLocationId);
    }
  };

  const plantingLabel = useMemo(() => {
    if (needs_transplant && isFinalLocationPage) {
      return t('MANAGEMENT_PLAN.WHERE_TRANSPLANT_LOCATION');
    } else if (already_in_ground && (!needs_transplant || !isFinalLocationPage)) {
      return t('MANAGEMENT_PLAN.SELECT_CURRENT_LOCATION');
    } else if (needs_transplant && !isFinalLocationPage) {
      return t('MANAGEMENT_PLAN.WHERE_START_LOCATION');
    } else if (is_seed) {
      return t('MANAGEMENT_PLAN.SELECT_A_SEEDING_LOCATION');
    } else {
      return t('MANAGEMENT_PLAN.SELECT_A_PLANTING_LOCATION');
    }
  }, [needs_transplant, isFinalLocationPage]);

  const [pinToggle, setPinToggle] = useState(!!pinCoordinate && showPinButton);
  useEffect(() => {
    setPinToggle(!!pinCoordinate && showPinButton);
  }, [showPinButton]);

  const handlePinMode = () => {
    setPinToggle((pinToggle) => !pinToggle);
  };

  const onSubmit = () =>
    history.push(
      getPlantingLocationPaths(variety_id, persistedFormData, isFinalLocationPage).submitPath,
    );
  const onGoBack = () =>
    history.push(
      getPlantingLocationPaths(variety_id, persistedFormData, isFinalLocationPage).goBackPath,
    );
  const onCancel = () =>
    history.push(
      getPlantingLocationPaths(variety_id, persistedFormData, isFinalLocationPage).cancelPath,
    );

  return (
    <>
      <Layout
        buttonGroup={
          <>
            <Button disabled={!selectedLocationId && !pinCoordinate} onClick={onSubmit} fullLength>
              {t('common:CONTINUE')}
            </Button>
          </>
        }
      >
        <MultiStepPageTitle
          onGoBack={onGoBack}
          onCancel={onCancel}
          cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
          title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
          value={isFinalLocationPage ? 60 : 37.5}
          style={{ marginBottom: '24px' }}
        />

        <p className={styles.planting_label}>{plantingLabel}</p>

        <LocationPicker
          onSelectLocation={setLocationId}
          farmCenterCoordinate={farmCenterCoordinate}
          selectedLocationIds={[selectedLocationId]}
          isPinMode={pinToggle}
          setPinCoordinate={setPinLocation}
          pinCoordinate={pinCoordinate}
          locations={cropLocations}
        />

        <div>
          <div className={styles.shown_label}>{t('MANAGEMENT_PLAN.LOCATION_SUBTEXT')}</div>
        </div>

        {showPinButton && pinToggle && (
          <Button
            color={'secondary'}
            style={{ marginBottom: '25px' }}
            onClick={handlePinMode}
            fullLength
          >
            <Cross />
            {t('MANAGEMENT_PLAN.REMOVE_PIN')}
          </Button>
        )}
        {showPinButton && !pinToggle && (
          <Button
            color={'secondary'}
            style={{ marginBottom: '25px' }}
            onClick={handlePinMode}
            fullLength
          >
            <LocationPin />
            {t('MANAGEMENT_PLAN.DROP_PIN')}
          </Button>
        )}

        {showInitialLocationCheckbox && !!selectedLocationId && (
          <Checkbox
            label={t('MANAGEMENT_PLAN.SELECTED_STARTING_LOCATION')}
            style={{ paddingBottom: '25px' }}
            checked={!!defaultInitialLocationId}
            onChange={defaultLocationCheckboxOnChange}
          />
        )}
      </Layout>
    </>
  );
}

PurePlantingLocation.prototype = {
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  isFinalLocationPage: PropTypes.bool,
  variety_id: PropTypes.string,
  history: PropTypes.object,
  locations: PropTypes.object,
  farmCenterCoordinate: PropTypes.object,
};
