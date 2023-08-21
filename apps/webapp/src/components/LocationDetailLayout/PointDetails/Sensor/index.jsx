/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import Button from '../../../Form/Button';
import { useTranslation } from 'react-i18next';
import RouterTab from '../../../RouterTab';
import PageTitle from '../../../PageTitle/v2';
import Input from '../../../Form/Input';
import ReactSelect from '../../../Form/ReactSelect';
import RetireSensorModal from '../../../Modals/RetireSensor';
import { container_planting_depth } from '../../../../util/convert-units/unit';
import Unit from '../../../Form/Unit';
import { useForm } from 'react-hook-form';
import Pill from '../../../Filter/Pill';
import styles from './styles.module.scss';
import clsx from 'clsx';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';

export default function PureSensorDetail({
  history,
  isAdmin,
  system,
  sensorInfo,
  handleRetire,
  showRetireModal,
  setShowRetireModal,
  showCannotRetireModal,
  setShowCannotRetireModal,
}) {
  const { t } = useTranslation();

  const { location_id, name, brand_name, depth, external_id, model, point, sensor_reading_types } =
    sensorInfo;
  const { register, getValues, watch, control, setValue } = useForm({
    defaultValues: {
      brand_name: 'ensemble_scientific',
      sensor_name: 'Input container data',
      latitude: '1',
      longtitude: '2',
      reading_types: '',
      external_identifier: 'Get container value',
      depth_unit: sensorInfo.depth_unit,
    },
    shouldUnregister: false,
    mode: 'onChange',
  });
  const DEPTH = 'depth';
  const DEPTH_UNIT = 'depth_unit';

  return (
    <div style={{ padding: '24px 16px 24px 24px' }}>
      <PageTitle
        title={name}
        onGoBack={() => history.push('/map')}
        style={{ marginBottom: '24px' }}
      />
      <RouterTab
        classes={{ container: { margin: '30px 8px 26px 0px' } }}
        history={history}
        tabs={[
          {
            label: t('SENSOR.VIEW_HEADER.READINGS'),
            path: `/sensor/${location_id}/readings`, // May need to be changed
          },
          {
            label: t('SENSOR.VIEW_HEADER.TASKS'),
            path: `/sensor/${location_id}/tasks`, // May need to be changed
          },
          {
            label: t('SENSOR.VIEW_HEADER.DETAILS'),
            path: `/sensor/${location_id}/details`,
          },
        ]}
      />
      <Input
        label={t('SENSOR.DETAIL.NAME')}
        style={{ paddingBottom: '32px', paddingTop: '24px' }}
        disabled={true}
        value={name}
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
          value={point.lat}
          classes={{ container: { flexGrow: 1 } }}
        />
        <Input
          label={t('SENSOR.DETAIL.LONGITUDE')}
          disabled={true}
          value={point.lng}
          classes={{ container: { flexGrow: 1 } }}
        />
      </div>
      <label>{t('SENSOR.READING.TYPES')}</label>
      <div className={clsx(styles.container)}>
        <div className={clsx(styles.pillContainer)}>
          {sensor_reading_types.map((type) => {
            return (
              <Pill
                key={type}
                label={t(`SENSOR.READING.${type.toUpperCase()}`)}
                removable={false}
                className={'activePill'}
                selected={true}
              />
            );
          })}
        </div>
      </div>

      <Unit
        register={register}
        defaultValue={depth}
        displayUnitName={DEPTH_UNIT}
        label={t('SENSOR.DETAIL.DEPTH')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={DEPTH}
        unitType={container_planting_depth}
        max={10000}
        system={system}
        control={control}
        style={{ paddingBottom: '32px' }}
        disabled={true}
      />

      <ReactSelect
        label={t('SENSOR.DETAIL.BRAND')}
        placeholder={brand_name}
        defaultValue={brand_name}
        isDisabled={true}
        style={{ paddingBottom: '32px' }}
        toolTipContent={t('SENSOR.DETAIL.BRAND_TOOLTIP')}
      />

      <Input
        label={t('SENSOR.DETAIL.MODEL')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        value={model}
      />

      <Input
        label={t('SENSOR.DETAIL.EXTERNAL_IDENTIFIER')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        toolTipContent={t('SENSOR.DETAIL.EXTERNAL_ID_TOOLTIP')}
        value={external_id}
      />
      {/* <Input
        label={t('SENSOR.DETAIL.PART_NUMBER')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        value={PART_NUMBER}
      />
      <Input
        label={t('SENSOR.DETAIL.HARDWARE_VERSION')}
        style={{ paddingBottom: '32px' }}
        disabled={true}
        optional={true}
        value={HARDWARE_VERSION}
      /> */}
      {isAdmin && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <Button
            type={'submit'}
            onClick={() => setShowRetireModal(true)} // Change accordingly
            color={'secondary'}
            style={{ width: '50%' }}
          >
            {t(`SENSOR.DETAIL.RETIRE`)}
          </Button>

          <Button
            type={'submit'}
            onClick={() => history.push(`/sensor/${location_id}/edit`)} // Change accordingly
            style={{ width: '50%' }}
          >
            {t(`SENSOR.DETAIL.EDIT`)}
          </Button>
        </div>
      )}
      {showCannotRetireModal && (
        <UnableToRetireModal dismissModal={() => setShowCannotRetireModal(false)} />
      )}
      {showRetireModal && (
        <RetireSensorModal dismissModal={() => setShowRetireModal(false)} onRetire={handleRetire} />
      )}
    </div>
  );
}
