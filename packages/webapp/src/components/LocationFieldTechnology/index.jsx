import Layout from '../Layout';
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

export default function PureLocationFieldTechnology({
  location,
  history,
  match,
  hasCrops,
  hasReadings,
  fieldTechnology,
}) {
  const { t } = useTranslation();
  const isExternalSensors = !!(
    fieldTechnology.externalSensors?.length || fieldTechnology.externalSensorArrays?.length
  );

  const handleClick = (ft) => {
    history.push(`/${ft.type}/${ft.location_id}/readings`);
  };

  const routerTabs = [
    {
      label: t('FARM_MAP.TAB.CROPS'),
      path: match.url.replace('field_technology', 'crops'),
    },
    {
      label: t('FARM_MAP.TAB.TASKS'),
      path: match.url.replace('field_technology', 'tasks'),
    },
    {
      label: t('FARM_MAP.TAB.DETAILS'),
      path: match.url.replace('field_technology', 'details'),
    },
    {
      label: t('FARM_MAP.TAB.FIELD_TECHNOLOGY'),
      path: match.url,
    },
  ];

  if (hasCrops) {
    routerTabs.splice(0, 0, {
      label: t('FARM_MAP.TAB.CROPS'),
      path: match.url.replace('field_technology', 'crops'),
    });
  } else if (hasReadings) {
    routerTabs.splice(0, 0, {
      label: t('FARM_MAP.TAB.READINGS'),
      path: match.url.replace('tasks', 'readings'),
    });
  }

  const FieldTechnologyLists = () => {
    // Render order
    const fieldTechnologyTypes = ['sensors', 'externalSensorArrays', 'externalSensors'];

    return fieldTechnologyTypes.map((key) => {
      if (key === 'externalSensorArrays' && fieldTechnology[key]?.length) {
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
                        <SensorListItem
                          key={sensor.id}
                          iconText={{
                            iconName: 'SENSOR',
                            label: sensor.id,
                            classes: {
                              icon: styles.sensorIcon,
                              label: styles.sensorLabel,
                            },
                          }}
                          middleContent={{
                            name: getDeviceType(sensor.deviceTypeKey),
                            status: {
                              status: isOnline ? Status.ONLINE : Status.OFFLINE,
                              pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
                              showHoverTooltip: false,
                            },
                          }}
                          actionIcon={{
                            iconName: 'chevron',
                            classes: {
                              icon: styles.sensorChevron,
                            },
                            onClick: (_e) => handleClick(esa),
                          }}
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
      } else if (key === 'externalSensors' && fieldTechnology[key]?.length) {
        return (
          <div key={key} className={styles.listWithHeading}>
            <div className={styles.listHeading}>{t('SENSOR.STANDALONE_SENSOR')}</div>
            <List compact className={styles.list}>
              {fieldTechnology[key]?.map((es) => {
                const sensor = es.sensors[0];
                const isOnline = isSameDay(new Date(sensor.last_seen), new Date());
                return (
                  <SensorListItem
                    key={sensor.id}
                    iconText={{
                      iconName: 'SENSOR',
                      label: sensor.id,
                      classes: {
                        icon: styles.sensorIcon,
                        label: styles.sensorLabel,
                      },
                    }}
                    middleContent={{
                      name: getDeviceType(sensor.deviceTypeKey),
                      status: {
                        status: isOnline ? Status.ONLINE : Status.OFFLINE,
                        pillText: isOnline ? t('STATUS.ONLINE') : t('STATUS.OFFLINE'),
                        showHoverTooltip: false,
                      },
                    }}
                    actionIcon={{
                      iconName: 'chevron',
                      classes: {
                        icon: styles.sensorChevron,
                      },
                      onClick: (_e) => handleClick(es),
                    }}
                    lastSeen={new Date(sensor.last_seen)}
                  />
                );
              })}
            </List>
          </div>
        );
      } else {
        if (fieldTechnology[key]?.length) {
          return (
            <div key={key} className={styles.listWithHeading}>
              <div className={styles.listHeading}>{t('FARM_MAP.MAP_FILTER.SENSOR')}</div>
              <List compact className={styles.list}>
                {fieldTechnology[key]?.map((sensor) => {
                  return (
                    <SensorListItem
                      key={sensor.location_id}
                      iconText={{
                        iconName: 'SENSOR',
                        label: sensor.name || sensor.location_id,
                        classes: {
                          icon: styles.sensorIcon,
                          label: styles.sensorLabel,
                        },
                      }}
                      middleContent={{
                        name: sensor.model || sensor.brand_name || '',
                      }}
                      actionIcon={{
                        iconName: 'chevron',
                        classes: {
                          icon: styles.sensorChevron,
                        },
                        onClick: (_e) => handleClick(sensor),
                      }}
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
    <Layout className={styles.fieldTechnologyContainer}>
      <PageTitle title={location.name} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={routerTabs}
      />
      <div className={styles.lists}>
        <FieldTechnologyLists />
      </div>
      {isExternalSensors && (
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
