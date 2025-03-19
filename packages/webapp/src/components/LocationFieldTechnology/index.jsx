import Layout from '../Layout';
import PageTitle from '../PageTitle/v2';
import RouterTab from '../RouterTab';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ExternalLinkIcon } from '../../assets/images/icon_external_link.svg';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';
import List from '../List';
import SensorListItem from '../List/ListItems/IconDescription/SensorListItem';
import { Status } from '../StatusIndicatorPill';
import { isSameDay } from '../../util/date-migrate-TS';

export default function PureLocationFieldTechnology({
  location,
  history,
  match,
  hasCrops,
  hasReadings,
  fieldTechnology,
}) {
  const { t } = useTranslation();

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
    const fieldTechnologyTypes = ['sensors', 'externalSensors', 'externalSensorArrays'];

    return fieldTechnologyTypes.map((key) => {
      if (key === 'externalSensorArrays') {
        return fieldTechnology[key]?.map((sa) => {
          return (
            <div key={sa.name}>
              <div>{sa.name}</div>
              <List compact className={styles.list}>
                {...sa.sensors?.map((sensor) => {
                  const isOnline = isSameDay(new Date(sensor.last_seen), new Date());
                  return (
                    <SensorListItem
                      key={sensor.location_id}
                      iconText={{
                        iconName: 'SENSOR',
                        label: sensor.location_id,
                        classes: {
                          icon: styles.sensorIcon,
                          label: styles.sensorLabel,
                        },
                      }}
                      middleContent={{
                        name: sensor.name,
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
                      }}
                    />
                  );
                })}
              </List>
            </div>
          );
        });
      }
    });
  };

  return (
    <Layout>
      <PageTitle title={location.name} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={routerTabs}
      />
      <div>
        <FieldTechnologyLists />
      </div>
      <div className={styles.manageEsci}>
        {t('MANAGE_ENTITY')}
        <Link className={styles.manage} to={{ pathname: '/farm', hash: '#esci-addon' }}>
          <ExternalLinkIcon />
          <span>{t('common:MANAGE_ENTITY', { entity: 'ESCI' })}</span>
        </Link>
      </div>
    </Layout>
  );
}
