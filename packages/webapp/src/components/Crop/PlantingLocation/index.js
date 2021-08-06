import styles from './styles.module.scss';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../Form/Button';
import LocationPicker from '../../LocationPicker';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { ReactComponent as Cross } from '../../../assets/images/map/cross.svg';
import { ReactComponent as LocationPin } from '../../../assets/images/map/location.svg';
import Checkbox from '../../Form/Checkbox';

export default function PurePlantingLocation({
  selectedLocationId,
  onContinue,
  onGoBack,
  onCancel,
  setLocationId,
  persistedFormData,
  transplant,
  progress,
  setPinLocation,
  pinLocation,
  onSelectCheckbox,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);

  const { needs_transplant, seeding_type, in_ground } = persistedFormData;
  let seeding_type_temp = seeding_type;
  if (in_ground === true) {
    seeding_type_temp = '';
  }
  const [pinMode, setPinMode] = useState(false);
  const [canUsePin, setCanUsePin] = useState(
    persistedFormData.wild_crop && persistedFormData.in_ground && pinMode,
  );

  const handlePinMode = () => {
    const currentPinMode = pinMode;
    setPinMode(!currentPinMode);
    setCanUsePin(!currentPinMode);
  };

  return (
    <>
      <Layout
        buttonGroup={
          <>
            <Button
              disabled={!selectedLocationId && !pinLocation}
              onClick={() => onContinue(pinLocation)}
              fullLength
            >
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
        </div>

        <LocationPicker
          className={styles.mapContainer}
          setLocationId={setLocationId}
          selectedLocationId={selectedLocationId}
          canUsePin={canUsePin}
          setPinLocation={setPinLocation}
          currentPin={pinLocation}
          canSelectMultipleLocations={false}
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

        {needs_transplant === true && selectedLocationId !== undefined && (
          <Checkbox
            label={t('MANAGEMENT_PLAN.SELECTED_STARTING_LOCATION')}
            style={{ paddingBottom: '25px' }}
            checked={!!persistedFormData?.farm?.default_initial_location_id}
            onChange={(e) => {
              onSelectCheckbox(e);
            }}
          />
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
