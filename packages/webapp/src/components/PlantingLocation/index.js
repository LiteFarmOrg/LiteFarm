import styles from './styles.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import PageTitle from '../PageTitle/v2';
import Button from '../Form/Button';
import ProgressBar from '../ProgressBar';
import LocationPicker from '../LocationPicker';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../Form';

export default function PurePlantingLocation({
    selectedLocation,
    onContinue,
    onGoBack,
    onCancel,
    setSelectedLocation,
    persistedFormData,
    useHookFormPersist,
    persistedPath,
}) {

    const { t } = useTranslation(['translation', 'common', 'crop']);

    const progress = 37.5;

    const {
        handleSubmit,
        getValues,
      } = useForm({
        mode: 'onChange',
        shouldUnregister: true,
    });

    useHookFormPersist(persistedPath, getValues);

    const {needs_transplant, managementPlanLocationId} = persistedFormData;


    return (
        <>
        <Form 
          buttonGroup={
              <Button disabled={selectedLocation === null} fullLength>
                {t('common:CONTINUE')}
              </Button>
          }
          onSubmit={handleSubmit(onContinue)}
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
            {(needs_transplant==='true')? t('MANAGEMENT_PLAN.SELECT_STARTING_LOCATION') : t('MANAGEMENT_PLAN.SELECT_PLANTING_LOCATION')}
          </div>
          <LocationPicker 
            className={styles.mapContainer} 
            setSelectedLocation={setSelectedLocation}
            selectedLocationId={managementPlanLocationId}
          />
          <div>
            <div className={styles.shown_label}>
              {t('MANAGEMENT_PLAN.LOCATION_SUBTEXT')}
            </div>
          </div>  
        </Form>     
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
};
