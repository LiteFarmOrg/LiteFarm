import useSelectionHandler from '../useSelectionHandler';
import styles from '../styles.module.scss';
import PureSelectionHandler from '../../../components/Map/SelectionHandler';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { canShowSelectionSelector, mapLocationsSelector } from '../../mapSlice';
import PurePreviewPopup from '../../../components/Map/PreviewPopup';
import { SENSOR } from '../../SensorReadings/constants';
import { sensorReadingsByLocationSelector } from '../mapSensorSlice';

export default function LocationSelectionModal({ history, selectingOnly }) {
  const { dismissSelectionModal } = useSelectionHandler();
  const showSelection = useSelector(canShowSelectionSelector);
  const locations = useSelector(mapLocationsSelector);
  const selectedLocation = locations[0];
  const sensorReadingsByLocation = useSelector(
    sensorReadingsByLocationSelector(selectedLocation?.id),
  );

  if (showSelection && locations.length === 1 && selectedLocation.type === SENSOR) {
    return (
      <div className={styles.selectionModal} onClick={dismissSelectionModal}>
        <div className={styles.selectionContainer}>
          <PurePreviewPopup
            location={selectedLocation}
            history={history}
            sensorReadings={sensorReadingsByLocation}
          />
        </div>
      </div>
    );
  } else {
    return (
      <>
        {showSelection && (
          <div className={styles.selectionModal} onClick={dismissSelectionModal}>
            <div className={styles.selectionContainer}>
              <PureSelectionHandler
                locations={locations}
                history={history}
                sensorReadings={sensorReadingsByLocation}
                selectingOnly={selectingOnly}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
