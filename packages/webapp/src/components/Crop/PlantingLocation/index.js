import styles from './styles.module.scss';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../Form/Button';
import LocationPicker from '../../LocationPicker';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { ReactComponent as Cross } from '../../../assets/images/map/cross.svg';
import { ReactComponent as LocationPin } from '../../../assets/images/map/location.svg';

export default function PurePlantingLocation({
  selectedLocationId,
  onContinue,
  onGoBack,
  onCancel,
  setLocationId,
  persistedFormData,
  useHookFormPersist,
  persistedPath,
  transplant,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);

  const { getValues } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const { needs_transplant, seeding_type, in_ground } = persistedFormData;
  let seeding_type_temp = seeding_type;
  if (in_ground === true) {
    seeding_type_temp = '';
  }

  useHookFormPersist(persistedPath, getValues);

  const [pinMode, setPinMode] = useState(false);

  const [canUsePin, setCanUsePin] = useState(
    persistedFormData.wild_crop && persistedFormData.in_ground && pinMode,
  );

  console.log(persistedFormData);

  const handlePinMode = () => {
    pinMode ? setPinMode(false) : setPinMode(true);
    setCanUsePin(persistedFormData.wild_crop && persistedFormData.in_ground && !pinMode);
  };

  return (
    <>
      {console.log('pinMode in PlantingLocation: ' + pinMode)}
      {console.log('canUsePin in PlantingLocation: ' + canUsePin)}
      <Layout
        buttonGroup={
          <>
            <Button disabled={!selectedLocationId} onClick={onContinue} fullLength>
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
          value={50}
          style={{ marginBottom: '24px' }}
        />

        <div className={styles.planting_label}>
          {seeding_type_temp === 'SEED'
            ? t('MANAGEMENT_PLAN.SELECT_A_SEEDING_LOCATION')
            : seeding_type_temp === 'SEEDLING_OR_PLANTING_STOCK'
            ? t('MANAGEMENT_PLAN.SELECT_A_PLANTING_LOCATION')
            : in_ground === true
            ? t('MANAGEMENT_PLAN.SELECT_CURRENT_LOCATION')
            : t('MANAGEMENT_PLAN.SELECT_PLANTING_LOCATION')}
          {/*{transplant*/}
          {/*  ? t('MANAGEMENT_PLAN.TRANSPLANT_LOCATION')*/}
          {/*  : needs_transplant*/}
          {/*  ? t('MANAGEMENT_PLAN.SELECT_STARTING_LOCATION')*/}
          {/*  : t('MANAGEMENT_PLAN.SELECT_PLANTING_LOCATION')*/}
          {/*}*/}
        </div>

        <LocationPicker
          className={styles.mapContainer}
          setLocationId={setLocationId}
          selectedLocationId={selectedLocationId}
          canUsePin={canUsePin}
          handleCanUsePin={setCanUsePin}
        />

        <div>
          <div className={styles.shown_label}>{t('MANAGEMENT_PLAN.LOCATION_SUBTEXT')}</div>
        </div>

        {persistedFormData.wild_crop && pinMode && (
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
        {persistedFormData.wild_crop && !pinMode && (
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
      </Layout>
    </>
  );
}

PurePlantingLocation.prototype = {
  selectedLocationId: PropTypes.object,
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  setLocationId: PropTypes.func,
  persistedFormData: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedPath: PropTypes.array,
  transplant: PropTypes.bool,
  progress: PropTypes.number,
};
