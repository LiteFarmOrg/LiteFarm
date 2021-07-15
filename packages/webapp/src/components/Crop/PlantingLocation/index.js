import styles from './styles.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../Form/Button';
import LocationPicker from '../../LocationPicker';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { ReactComponent as Cross } from '../../../assets/images/map/cross.svg';
import { ReactComponent as LocationPin } from '../../../assets/images/map/location.svg';
import { ReactComponent as MapPin } from '../../../assets/images/map/map_pin.svg';

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
  progress,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);

  const { getValues } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  useHookFormPersist(persistedPath, getValues);

  const { needs_transplant } = persistedFormData;

  return (
    <>
      <Layout
        buttonGroup={
          <>
            <Button disabled={!selectedLocationId} onClick={onContinue} fullLength>
              {t('common:CONTINUE')}
            </Button>
            <Button color={'secondary'} fullLength>
              <LocationPin></LocationPin>
              {t('MANAGEMENT_PLAN.DROP_PIN')}
            </Button>
            <Button color={'secondary'} fullLength>
              <Cross />
              {t('MANAGEMENT_PLAN.REMOVE_PIN')}
            </Button>
          </>
        }
      >
        <MultiStepPageTitle
          onGoBack={onGoBack}
          onCancel={onCancel}
          cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
          title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
          value={progress}
          style={{ marginBottom: '24px' }}
        />

        <div className={styles.planting_label}>
          {transplant
            ? t('MANAGEMENT_PLAN.TRANSPLANT_LOCATION')
            : needs_transplant
            ? t('MANAGEMENT_PLAN.SELECT_STARTING_LOCATION')
            : t('MANAGEMENT_PLAN.SELECT_PLANTING_LOCATION')}
        </div>
        <LocationPicker
          className={styles.mapContainer}
          setLocationId={setLocationId}
          selectedLocationId={selectedLocationId}
        />
        <div>
          <div className={styles.shown_label}>{t('MANAGEMENT_PLAN.LOCATION_SUBTEXT')}</div>
        </div>
      </Layout>
    </>
  );
}

PurePlantingLocation.prototype = {
  selectedLocation: PropTypes.object,
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
