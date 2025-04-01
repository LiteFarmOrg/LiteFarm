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

import Layout from '../Layout';
import layoutStyles from '../Layout/layout.module.scss';
import PageTitle from '../PageTitle/v2';
import RouterTab from '../RouterTab';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';
import List from '../List';
import SensorListItem from '../List/ListItems/IconDescription/SensorListItem';
import { Status } from '../StatusIndicatorPill';
import { isSameDay } from '../../util/date-migrate-TS';
import Icon from '../Icons';
import { getDeviceType } from '../Sensor/v2/constants';
import { Variant } from '../RouterTab/Tab';
import { locationEnum } from '../../containers/Map/constants';

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
    if (ft.isAddonSensor && ft.type === locationEnum.sensor) {
      history.push(`/${ft.type}/${ft.id}/readings`);
    } else if (ft.isAddonSensor && ft.type === locationEnum.sensor_array) {
      history.push(`/${ft.type}/${ft.id}/readings`);
    } else {
      history.push(`/${ft.type}/${ft.location_id}/details`);
    }
  };

  const ListItem = ({ key, label, middleContent, onClickLocation, lastSeen }) => {
    return (
      <SensorListItem
        key={key}
        iconText={{
          iconName: 'SENSOR',
          label: label,
          classes: {
            icon: styles.sensorIcon,
            label: styles.sensorLabel,
          },
        }}
        middleContent={middleContent}
        actionIcon={{
          iconName: 'chevron',
          classes: {
            icon: styles.sensorChevron,
          },
          onClick: (_e) => handleClick(onClickLocation),
        }}
        lastSeen={lastSeen}
      />
    );
  };

  const FieldTechnologyLists = () => {
    // Render order
    const fieldTechnologyTypes = ['sensors', 'addonSensorArrays', 'addonSensors'];

    return fieldTechnologyTypes.map((key) => {
      if (fieldTechnology[key]?.length) {
        if (key === 'addonSensorArrays') {
          return (
            <div key={key}>
              {fieldTechnology[key]?.map((esa) => {
                return (
                  <div key={esa.name} className={styles.listWithHeading}>
                    <div className={styles.listHeading}>{esa.name}</div>
                    <List compact className={styles.list}>
                      {...esa.sensors?.map((sensor) => {
                        const isOnline = isSameDay(new Date(sensor.last_seen), new Date());
                        return (
                          <ListItem
                            key={sensor.id}
                            label={sensor.id}
                            middleContent={{
                              name: getDeviceType(sensor.deviceTypeKey),
                              status: {
                                status: isOnline ? Status.ONLINE : Status.OFFLINE,
                                pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
                                showHoverTooltip: false,
                              },
                            }}
                            onClickLocation={esa}
                            lastSeen={new Date(sensor.last_seen)}
                          />
                        );
                      })}
                    </List>
                  </div>
                );
              })}
            </div>
          );
        } else if (key === 'addonSensors') {
          return (
            <div key={key} className={styles.listWithHeading}>
              <div className={styles.listHeading}>{t('SENSOR.STANDALONE_SENSOR')}</div>
              <List compact className={styles.list}>
                {...fieldTechnology[key]?.map((es) => {
                  const sensor = es.sensors[0];
                  const isOnline = isSameDay(new Date(sensor.last_seen), new Date());
                  return (
                    <ListItem
                      key={sensor.id}
                      label={sensor.id}
                      middleContent={{
                        name: getDeviceType(sensor.deviceTypeKey),
                        status: {
                          status: isOnline ? Status.ONLINE : Status.OFFLINE,
                          pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
                          showHoverTooltip: false,
                        },
                      }}
                      onClickLocation={es}
                      lastSeen={new Date(sensor.last_seen)}
                    />
                  );
                })}
              </List>
            </div>
          );
        } else {
          return (
            <div key={key} className={styles.listWithHeading}>
              <div className={styles.listHeading}>{t('FARM_MAP.MAP_FILTER.SENSOR')}</div>
              <List compact className={styles.list}>
                {...fieldTechnology[key]?.map((sensor) => {
                  return (
                    <ListItem
                      key={sensor.location_id}
                      label={sensor.name || sensor.location_id}
                      middleContent={{
                        name: sensor.model || sensor.brand_name || '',
                      }}
                      onClickLocation={sensor}
                    />
                  );
                })}
              </List>
            </div>
          );
        }
      }
    });
  };

  return (
    <Layout className={layoutStyles.paperContainer}>
      <PageTitle title={location.name} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={routerTabs}
        variant={Variant.UNDERLINE}
      />
      <div className={styles.lists}>
        <FieldTechnologyLists />
      </div>
      {hasAddonSensors && (
        <div className={styles.manageEsci}>
          <div className={styles.manageText}>
            <Trans
              i18nKey={'SENSOR.ESCI.TO_MANAGE_SENSORS'}
              shouldUnescape={true}
              tOptions={{ url: 'https://app.esci.io/' }}
            />
          </div>
          <div className={styles.manageLink}>
            <Link to={{ pathname: '/farm', hash: '#esci-addon' }}>
              <Icon iconName="EXTERNAL_LINK" className={styles.externalLinkIcon} />
              <span>{t('SENSOR.ESCI.MANAGE_LINK')}</span>
            </Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
