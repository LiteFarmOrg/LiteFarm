import styles from './styles.module.scss';
import React from 'react';
import Button from '../../Form/Button';
import LocationPicker from '../../LocationPicker/MultiLocationPicker';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';

export default function PureTaskLocations({
  setTaskLocations,
  taskLocations,
  onContinue,
  onGoBack,
  onCancel,
  storedLocations,
}) {
  const { t } = useTranslation();
  const progress = 43;
  return (
    <>
      <Layout
        buttonGroup={
          <>
            <Button
              disabled={!taskLocations || taskLocations.length === 0}
              onClick={onContinue}
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
          cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
          title={t('MANAGEMENT_DETAIL.ADD_A_TASK')}
          value={progress}
        />

        <Main style={{ marginTop: '24px', marginBottom: '24px' }}>
          {t('TASK.SELECT_TASK_LOCATIONS')}
        </Main>
        <LocationPicker
          className={styles.mapContainer}
          canUsePin={false}
          setPinLocation={() => {}}
          canSelectMultipleLocations={true}
          setLocationIds={setTaskLocations}
          selectedLocationIds={taskLocations}
          storedLocations={storedLocations}
        />
      </Layout>
    </>
  );
}

PureTaskLocations.prototype = {
  setTaskLocations: PropTypes.func,
  taskLocations: PropTypes.array,
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  storedLocations: PropTypes.array,
};
