import styles from './styles.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import PageTitle from '../PageTitle/v2';
import Button from '../Form/Button';
import ProgressBar from '../ProgressBar';
import LocationPicker from '../LocationPicker';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Layout from '../Layout';

export default function PurePlantingLocation({
  selectedLocation,
  onContinue,
  onGoBack,
  onCancel,
  setSelectedLocation,
  persistedFormData,
  useHookFormPersist,
  persistedPath,
  transplant,
  progress,
}) {

  const { t } = useTranslation(['translation', 'common', 'crop']);

  const {
    getValues,
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  useHookFormPersist(persistedPath, getValues);

  const { needs_transplant } = persistedFormData;

  const selectedLocationId = transplant? persistedFormData.transplantLocationId : persistedFormData.managementPlanLocationId;

  return (
    <>
      <Layout
        buttonGroup={
          <Button disabled={selectedLocation === null} onClick={onContinue} fullLength>
            {t('common:CONTINUE')}
          </Button>
        }
      >
        <PageTitle title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
          onGoBack={onGoBack}
          onCancel={onCancel}
        />
        <div
          style={{
            marginBottom: '24px',
            marginTop: '8px',
          }}
        >
          <ProgressBar value={progress} />
        </div>
        <div className={styles.planting_label}>
          {(transplant)?
           t('MANAGEMENT_PLAN.TRANSPLANT_LOCATION') : ((needs_transplant) ? t('MANAGEMENT_PLAN.SELECT_STARTING_LOCATION') : t('MANAGEMENT_PLAN.SELECT_PLANTING_LOCATION'))
          }
        </div>
        <LocationPicker
          className={styles.mapContainer}
          setSelectedLocation={setSelectedLocation}
          selectedLocationId={selectedLocationId}
        />
        <div>
          <div className={styles.shown_label}>
            {t('MANAGEMENT_PLAN.LOCATION_SUBTEXT')}
          </div>
        </div>
      </Layout>
    </>
  )
}

PurePlantingLocation.prototype = {
  selectedLocation: PropTypes.object,
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  setSelectedLocation: PropTypes.func,
  persistedFormData: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedPath: PropTypes.array,
  transplant: PropTypes.bool,
  progress: PropTypes.number,
};
