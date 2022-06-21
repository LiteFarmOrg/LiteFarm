import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import RouterTab from '../../RouterTab';
import Layout from '../../Layout';
import PageTitle from '../../PageTitle/v2';
import Input from '../../Form/Input';
import FilterPillSelect from '../../Filter/FilterPillSelect';

export default function PureSensorDetail({ history, user, match }) {
  const isAdmin = user || true;
  const sensorName = match.params.sensor_id;
  const { t } = useTranslation();
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
      {/* TODO: Dropdown brand selection with help text */}

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
        toolTipContent={t('SENSOR.DETAIL.TOOL_TIP')}
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
          onClick={() => history.push('/retire_sensor')} // Change accordingly
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

      {/* <Layout
        buttonGroup={
            isAdmin && (
                <>
                    <Button
                    type={'submit'}
                    onClick={() => history.push('/retire_sensor')} // Change accordingly
                    color={'secondary'}
                    >
                    {t(`SENSOR.DETAIL.RETIRE`)}
                    </Button>

                    <Button
                    type={'submit'}
                    onClick={() => history.push('/edit_sensor')} // Change accordingly
                    >
                    {t(`SENSOR.DETAIL.EDIT`)}
                    </Button>
                </>
            )
        }

      /> */}
    </div>
  );
}
