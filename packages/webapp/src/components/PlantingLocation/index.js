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
    variety_id,
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

    const persistedPath = [`/crop/${variety_id}/add_management_plan`];
    useHookFormPersist(persistedPath, getValues);

    const {managementPlanLocationId} = persistedFormData;

    console.log(managementPlanLocationId);

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
          <PageTitle title={'Add management plan'} 
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
          <div className={styles.planting_label}>{'Select a planting location'}</div>
          <LocationPicker 
            className={styles.mapContainer} 
            setSelectedLocation={setSelectedLocation}
            selectedLocationId={managementPlanLocationId}
          />
          <div>
            <div className={styles.shown_label}>
              {'Only locations that can contain crops are shown'}
            </div>
          </div>  
        </Form>     
      </>
    )
}

PurePlantingLocation.prototype = {

};