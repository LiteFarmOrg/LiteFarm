import React, { useMemo } from 'react';
import Button from '../../Form/Button';
import LocationPicker from '../../LocationPicker/SingleLocationPicker';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { cloneObject } from '../../../util';

export default function PureTaskLocations({
  locations,
  onContinue,
  onGoBack,
  onCancel,
  farmCenterCoordinate,
  persistedFormData,
  useHookFormPersist,
  isMulti = true,
  title,
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
  const { getValues, watch, setValue } = useForm({
    defaultValues: cloneObject({ ...persistedFormData, locations: defaultLocations }),
    shouldUnregister: false,
  });
  useHookFormPersist(getValues);
  const LOCATIONS = 'locations';
  const selectedLocations = watch(LOCATIONS);
  const selectedLocationIds = useMemo(
    () => selectedLocations?.map(({ location_id }) => location_id),
    [selectedLocations],
  );

  const onSelectLocation = (location_id) => {
    setValue(
      LOCATIONS,
      isMulti ? getSelectedLocations(location_id, selectedLocations) : [{ location_id }],
    );
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

  return (
    <>
      <Layout
        buttonGroup={
          <>
            <Button disabled={!selectedLocations?.length} onClick={onContinue} fullLength>
              {t('common:CONTINUE')}
            </Button>
          </>
        }
      >
        <MultiStepPageTitle
          onGoBack={onGoBack}
          onCancel={onCancel}
          cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
          title={t('MANAGEMENT_DETAIL.ADD_A_TASK')}
          value={progress}
        />

        <Main style={{ marginTop: '24px', marginBottom: '24px' }}>
          {title || t('TASK.SELECT_TASK_LOCATIONS')}
        </Main>
        <LocationPicker
          onSelectLocation={onSelectLocation}
          clearLocations={clearLocations}
          selectedLocationIds={selectedLocationIds}
          locations={locations}
          farmCenterCoordinate={farmCenterCoordinate}
        />
      </Layout>
    </>
  );
}

PureTaskLocations.prototype = {
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  storedLocations: PropTypes.array,
  locations: PropTypes.arrayOf(PropTypes.object),
  farmCenterCoordinate: PropTypes.object,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  isMulti: PropTypes.bool,
  title: PropTypes.string,
};
