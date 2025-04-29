/*
 *  Copyright 2025 LiteFarm.org
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

import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';
import RouterTab from '../RouterTab';
import styles from './styles.module.scss';
import CardLayout from '../Layout/CardLayout';
import List from '../List';
import SensorListItem from '../List/ListItems/IconDescription/SensorListItem';
import { Status } from '../StatusIndicatorPill';
import { isLessThanTwelveHrsAgo } from '../../util/date-migrate-TS';
import { getDeviceType } from '../Sensor/v2/constants';
import { Variant } from '../RouterTab/Tab';
import { locationEnum } from '../../containers/Map/constants';
import ManageESciSection from '../ManageESciSection';

export default function PureLocationFieldTechnology({
  location,
  history,
  match,
  fieldTechnology,
  routerTabs,
}) {
  const { t } = useTranslation();
  const hasAddonSensors = !!(
    fieldTechnology.addonSensors?.length || fieldTechnology.addonSensorArrays?.length
  );

  const handleClick = (ft) => {
    const path =
      ft.isAddonSensor && [locationEnum.sensor, locationEnum.sensor_array].includes(ft.type)
        ? `/${ft.type}/${ft.location_id}`
        : `/${ft.type}/${ft.location_id}/details`;
    history.push(path);
  };

  const ListItem = ({ label, middleContent, onClickLocation, lastSeen, showLastSeen, ...rest }) => (
    <SensorListItem
      {...rest}
      iconText={{
        iconName: 'SENSOR',
        label,
        classes: { icon: styles.sensorIcon, label: styles.sensorLabel },
      }}
      middleContent={middleContent}
      actionIcon={{
        iconName: 'chevron',
        classes: { icon: styles.sensorChevron },
        onClick: () => handleClick(onClickLocation),
      }}
      lastSeen={lastSeen}
      showLastSeen={showLastSeen}
    />
  );

  const SensorList = ({
    title,
    sensors,
    onClickLocationMapper,
    isAddonSensor = false,
    ...rest
  }) => (
    <div {...rest} className={styles.listWithHeading}>
      <div className={styles.listHeading}>{title}</div>
      <List compact className={styles.list}>
        {sensors.map((sensor) => {
          const isOnline = isLessThanTwelveHrsAgo(new Date(sensor.last_seen));
          return (
            <ListItem
              key={isAddonSensor ? sensor.id : sensor.location_id}
              label={isAddonSensor ? sensor.id : sensor.name || sensor.location_id}
              middleContent={{
                name: isAddonSensor
                  ? getDeviceType(sensor.deviceTypeKey)
                  : sensor.model || sensor.brand_name,
                status: isAddonSensor && {
                  status: isOnline ? Status.ONLINE : Status.OFFLINE,
                  pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
                  tooltipText: isOnline
                    ? t('STATUS.SENSOR.ONLINE_TOOLTIP')
                    : t('STATUS.SENSOR.OFFLINE_TOOLTIP'),
                },
              }}
              onClickLocation={onClickLocationMapper(sensor)}
              lastSeen={sensor.last_seen && new Date(sensor.last_seen)}
              showLastSeen={isAddonSensor}
            />
          );
        })}
      </List>
    </div>
  );

  return (
    <CardLayout>
      <PageTitle title={location.name} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={routerTabs}
        variant={Variant.UNDERLINE}
      />
      <div className={styles.lists}>
        {!!fieldTechnology.sensors?.length && (
          <SensorList
            title={t('FARM_MAP.MAP_FILTER.SENSOR')}
            sensors={fieldTechnology.sensors}
            onClickLocationMapper={(sensor) => sensor}
          />
        )}
        {!!fieldTechnology.addonSensorArrays?.length &&
          fieldTechnology.addonSensorArrays.map((addonSensorArray) => (
            <SensorList
              key={addonSensorArray.name}
              title={addonSensorArray.name}
              sensors={addonSensorArray.sensors}
              onClickLocationMapper={() => addonSensorArray}
              isAddonSensor
            />
          ))}
        {!!fieldTechnology.addonSensors?.length && (
          <SensorList
            title={t('SENSOR.STANDALONE_SENSOR')}
            sensors={fieldTechnology.addonSensors.flatMap((addonSensor) => addonSensor.sensors)}
            onClickLocationMapper={(sensor) =>
              fieldTechnology.addonSensors.find((addonSensor) =>
                addonSensor.sensors.includes(sensor),
              )
            }
            isAddonSensor
          />
        )}
      </div>
      {hasAddonSensors && <ManageESciSection t={t} />}
    </CardLayout>
  );
}
