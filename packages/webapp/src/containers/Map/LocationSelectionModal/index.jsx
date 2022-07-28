import useSelectionHandler from '../useSelectionHandler';
import styles from '../styles.module.scss';
import PureSelectionHandler from '../../../components/Map/SelectionHandler';
import React from 'react';
import { useSelector } from 'react-redux';
import { canShowSelectionSelector, mapLocationsSelector } from '../../mapSlice';
import PurePreviewPopup from '../../../components/Map/PreviewPopup';
import { SENSOR } from '../../SensorReadings/constants';

export default function LocationSelectionModal({ history, sensorReadings, selectingOnly }) {
  const { dismissSelectionModal } = useSelectionHandler();
  const showSelection = useSelector(canShowSelectionSelector);
  const locations = useSelector(mapLocationsSelector);
  const locationSensorReadings = Object.values(sensorReadings).filter(
    (reading) => reading.location_id === locations[0]?.id,
  );
  if (showSelection && locations.length === 1 && locations[0].type === SENSOR) {
    return (
      <div className={styles.selectionModal} onClick={dismissSelectionModal}>
        <div className={styles.selectionContainer}>
          <PurePreviewPopup
            location={locations[0]}
            history={history}
            sensorReadings={locationSensorReadings}
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
                sensorReadings={locationSensorReadings}
                selectingOnly={selectingOnly}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
