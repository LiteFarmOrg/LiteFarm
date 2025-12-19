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

import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'react-i18next';
import { VscLocation } from 'react-icons/vsc';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { Main } from '../../../Typography';
import TextButton from '../../../Form/Button/TextButton';
import MainContent, { IconType } from '../../../Expandable/MainContent';
import ExpandableItem from '../../../Expandable/ExpandableItem';
import useExpandable from '../../../Expandable/useExpandableItem';
import {
  type SensorSummary,
  type GroupedSensors,
  SensorType,
} from '../../../../containers/SensorList/useGroupedSensors';
import SensorTable, { SensorTableVariant } from '../SensorTable';
import OverviewStats, { OverviewStatsProps } from '../../../OverviewStats';
import { ReactComponent as SensorIcon } from '../../../../assets/images/map/signal-01.svg';
import { ReactComponent as SensorArrayIcon } from '../../../../assets/images/farmMapFilter/SensorArray.svg';
import { Location, UserFarm } from '../../../../types';
import { toTranslationKey } from '../../../../util';
import styles from './styles.module.scss';
import LocationViewer from '../../../LocationPicker/LocationViewer';
import { useMaxZoom } from '../../../../containers/Map/useMaxZoom';
import { createSmartIrrigationDisplayName } from '../../../../util/smartIrrigation';

const FormatKpiLabel: OverviewStatsProps['FormattedLabelComponent'] = ({ statKey, label }) => {
  const Icon = statKey === SensorType.SENSOR_ARRAY ? SensorArrayIcon : SensorIcon;
  return (
    <div className={styles.kpiLabel}>
      <span className={styles.iconWrapper}>
        <Icon />
      </span>
      <span className={styles.text}>{label}</span>
    </div>
  );
};

const DetectedFields = ({ fields = [], t }: { fields: Location['name'][]; t: TFunction }) => {
  if (!fields.length) {
    return null;
  }

  return (
    <div>
      <Main className={styles.fieldListLead}>{t('SENSOR.DETAIL.DETECTED_FIELD')}</Main>
      <ul className={styles.fieldList}>
        {fields.map((field) => {
          return <li key={field}>{field}</li>;
        })}
      </ul>
    </div>
  );
};

const SensorIconWithNumber = ({ number }: { number: number }) => {
  return (
    <div className={styles.sensorIconWithNumber}>
      <SensorIcon />
      <div className={styles.number}>{number}</div>
    </div>
  );
};

type EsciSensorListProps = {
  groupedSensors: GroupedSensors[];
  summary: SensorSummary;
  userFarm: UserFarm;
};

const EsciSensorList = ({ groupedSensors, summary, userFarm }: EsciSensorListProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const [mapLocations, setMapLocations] = useState<Location[]>([]);
  const [mapOpen, setMapOpen] = useState<boolean>(false);
  const { maxZoomRef, getMaxZoom } = useMaxZoom();

  const handleSeeOnMap = (location: Location) => {
    setMapLocations([location]);
    setMapOpen(true);
  };

  const handleMapSelect = () => {
    if (!mapLocations.length) return;
    const selectedLocation = mapLocations[0];

    const cleanSensorId = (id: string): string => id.replace(/^sensor_/, '');

    const readingsUrl =
      selectedLocation.type === SensorType.SENSOR_ARRAY
        ? `/sensor_array/${selectedLocation.id}`
        : `/sensor/${cleanSensorId(selectedLocation.id)}`;

    navigate(readingsUrl);
  };

  const handleClose = () => {
    setMapOpen(false);
  };

  const kpiTranslationMappings = Object.entries(summary).reduce<
    OverviewStatsProps['translationMappings']
  >((acc, [key, count]) => {
    if (count) {
      acc.push(
        key === SensorType.SENSOR_ARRAY
          ? { key: SensorType.SENSOR_ARRAY, translationKey: 'SENSOR.SENSOR_ARRAYS' }
          : { key, translationKey: `SENSOR.DEVICE_TYPES.${toTranslationKey(key)}` },
      );
    }

    return acc;
  }, []);

  return (
    <>
      {mapOpen ? (
        <LocationViewer
          locations={mapLocations}
          userFarm={userFarm}
          maxZoomRef={maxZoomRef}
          getMaxZoom={getMaxZoom}
          handleClose={handleClose}
          onSelect={handleMapSelect}
        />
      ) : (
        <div className={styles.wrapper}>
          <Main className={styles.title}>
            {t('SENSOR.PARTNER_SENSOR_LIST', { partner: 'Ensemble' })}
          </Main>
          <OverviewStats
            stats={summary}
            translationMappings={kpiTranslationMappings}
            FormattedLabelComponent={FormatKpiLabel}
            isCompact={isCompact}
          />
          <div className={styles.sensorGroups}>
            {groupedSensors.map(({ id, point, type, sensors, fields, label, system }) => {
              const isExpanded = expandedIds.includes(id);

              return (
                <Fragment key={id}>
                  <ExpandableItem
                    itemKey={id}
                    classes={{
                      container: clsx(styles.expandableContainer, isExpanded ? styles.active : ''),
                      mainContentWithIcon: styles.expandableHeader,
                    }}
                    isExpanded={isExpanded}
                    iconClickOnly={false}
                    onClick={() => toggleExpanded(id)}
                    leftCollapseIcon
                    mainContent={
                      <MainContent isExpanded={isExpanded} iconType={IconType.SIMPLE}>
                        <div className={styles.mainContent}>
                          <SensorIconWithNumber number={sensors.length} />
                          <span>
                            {createSmartIrrigationDisplayName({
                              label,
                              system,
                              fallback:
                                type === SensorType.SENSOR_ARRAY
                                  ? t('SENSOR.SENSOR_ARRAY')
                                  : t('SENSOR.STANDALONE_SENSOR'),
                            })}
                          </span>
                        </div>
                      </MainContent>
                    }
                    expandedContent={
                      <div className={styles.expandedContent}>
                        <SensorTable
                          data={sensors}
                          variant={SensorTableVariant.SIMPLE}
                          isCompact={isCompact}
                        />
                        <DetectedFields t={t} fields={fields.map(({ name }) => name)} />
                        <TextButton
                          className={styles.seeOnMapButton}
                          onClick={() =>
                            handleSeeOnMap({
                              id,
                              name: id,
                              location_id: id,
                              point,
                              type: type,
                            })
                          }
                        >
                          <VscLocation size={24} className={styles.mapPinIcon} />
                          {t('common:SEE_ON_MAP')}
                        </TextButton>
                      </div>
                    }
                  />
                </Fragment>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default EsciSensorList;
