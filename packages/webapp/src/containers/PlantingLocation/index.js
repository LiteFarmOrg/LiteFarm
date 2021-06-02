import React, { useState } from 'react';
import styles from './styles.module.scss';
import PageTitle from '../../components/PageTitle/v2';
import Button from '../../components/Form/Button';
import ProgressBar from '../../components/ProgressBar';
import LocationPicker from '../../components/LocationPicker';
import { useTranslation } from 'react-i18next';
import Form from '../../components/Form';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';


export default function PlantingLocation({ history, match}) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  console.log(selectedLocation);

  const variety_id = match.params.variety_id;

  const {
    handleSubmit,
    getValues,
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const persistedPath = [`/crop${variety_id}/add_management_plan`];

  useHookFormPersist(persistedPath, getValues);

  const persistedFormData = useSelector(hookFormPersistSelector);

  const { t } = useTranslation(['translation', 'common', 'crop']);

  const onContinue = (data) => {
    // TODO - add path 
    if (persistedFormData.needs_transplant === 'true') {
      console.log("Go to 1344");
    } else {
      console.log("Go to 1340");
    }
  }

  const onGoBack = () => {
    history.push(`/crop/${variety_id}/add_management_plan`);
  }

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  }

  const progress = 37.5;

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
        <LocationPicker className={styles.mapContainer} setSelectedLocation={setSelectedLocation} />
        <div>
          <div className={styles.shown_label}>
            {'Only locations that can contain crops are shown'}
          </div>
        </div>  
      </Form>     
    </>
  );
}
