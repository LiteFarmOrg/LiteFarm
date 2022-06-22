import { useState } from 'react';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import RouterTab from '../../RouterTab';
import PageTitle from '../../PageTitle/v2';
import Input from '../../Form/Input';
import ReactSelect from '../../Form/ReactSelect';
import RetireSensorModal from '../../Modals/RetireSensor';

export default function PureSensorDetail({ history, user, match }) {
  const isAdmin = user || true;
  const [showRetireModal, setShowRetireModal] = useState(false);
  const sensorName = match.params.sensor_id;
  const { t } = useTranslation();
  const brand_names = [
    {
      label: 'Ensemble Scientific',
      value: 'Ensemble',
      onClick: () => console.log('Reroute'),
    },
  ];
  const styles = {
    buttonContainer: {
      display: 'flex',
    },
    leftButton: {
      float: 'right',
    },
    rightButton: {
      float: 'right',
    },
  };

  return (
    <div>
      <PageTitle
        title={'CHANGE'}
        onGoBack={() => history.onGoBack}
        style={{ marginBottom: '24px', marginTop: '24px' }}
      />
      <RouterTab
        classes={{ container: { margin: '24px 0 24px 0' } }}
        history={history}
        tabs={[
          {
            label: t('SENSOR.VIEW_HEADER.READINGS'),
            path: `/`,
            state: location?.state,
          },
          {
            label: t('SENSOR.VIEW_HEADER.TASKS'),
            path: `/`,
            state: location?.state,
          },
          {
            label: t('SENSOR.VIEW_HEADER.DETAILS'),
            path: `/`,
            state: location?.state,
          },
        ]}
      />
      <Input
        label={t('SENSOR.DETAIL.NAME')}
        style={{ paddingBottom: '32px', paddingTop: '24px' }}
        disabled={true}
        value={'CHANGE'}
      />
      <div
        className={'latLong'}
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '32px',
          width: '100%',
          gap: '16px',
        }}
      >
        <Input
          label={t('SENSOR.DETAIL.LATITUDE')}
          disabled={true}
          value={'CHANGE'}
          classes={{ container: { flexGrow: 1 } }}
        />
        <Input
          label={t('SENSOR.DETAIL.LONGITUDE')}
          disabled={true}
          value={'CHANGE'}
          classes={{ container: { flexGrow: 1 } }}
        />
      </div>

      {/* TODO: Multi select pill reading types */}
      {/* TODO: Depth with unit conversion */}

      <ReactSelect
        label={t('SENSOR.DETAIL.BRAND')}
        defaultValue={'Ensemble Scientific'}
        isDisabled={true}
        options={brand_names}
        style={{ paddingBottom: '32px' }}
        toolTipContent={t('SENSOR.DETAIL.BRAND_TOOLTIP')}
      />

      <Input
        label={t('SENSOR.DETAIL.MODEL')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        value={'CHANGE'}
      />

      <Input
        label={t('SENSOR.DETAIL.EXTERNAL_IDENTIFIER')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        toolTipContent={t('SENSOR.DETAIL.EXTERNAL_ID_TOOLTIP')}
        value={'CHANGE'}
      />
      <Input
        label={t('SENSOR.DETAIL.PART_NUMBER')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        value={'CHANGE'}
      />
      <Input
        label={t('SENSOR.DETAIL.HARDWARE_VERSION')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        value={'CHANGE'}
      />
      {isAdmin && (
        <div
          className={'buttonGroup'}
          style={{
            flexDirection: 'row',
            display: 'inline-flex',
            paddingBottom: '40px',
            width: '100%',
            gap: '16px',
          }}
        >
          <Button
            type={'submit'}
            onClick={() => setShowRetireModal(true)} // Change accordingly
            color={'secondary'}
            classes={{ container: { flexGrow: 1 } }}
          >
            {t(`SENSOR.DETAIL.RETIRE`)}
          </Button>

          <Button
            type={'submit'}
            onClick={() => history.push('/edit_sensor')} // Change accordingly
            classes={{ container: { flexGrow: 1 } }}
          >
            {t(`SENSOR.DETAIL.EDIT`)}
          </Button>
        </div>
      )}
      {showRetireModal && <RetireSensorModal dismissModal={() => setShowRetireModal(false)} />}
    </div>
  );
}
