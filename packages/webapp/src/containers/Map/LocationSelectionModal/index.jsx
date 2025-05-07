import useSelectionHandler from '../useSelectionHandler';
import styles from '../styles.module.scss';
import PureSelectionHandler from '../../../components/Map/SelectionHandler';
import { useSelector } from 'react-redux';
import { canShowSelectionSelector, mapLocationsSelector } from '../../mapSlice';
import PurePreviewPopup from '../../../components/Map/PreviewPopup';
import { mapSensorSelector, sensorReadingsByLocationSelector } from '../mapSensorSlice';
import { isTouchDevice } from '../../../util/device';
import { SensorType } from '../../SensorList/useGroupedSensors';

export default function LocationSelectionModal({ history, selectingOnly }) {
  const { dismissSelectionModal } = useSelectionHandler();
  const showSelection = useSelector(canShowSelectionSelector);
  const locations = useSelector(mapLocationsSelector);
  const selectedLocation = locations[0];
  const sensorReadingsByLocation = useSelector(
    sensorReadingsByLocationSelector(selectedLocation?.id),
  );
  const sensorReadings = useSelector(mapSensorSelector);

  if (
    showSelection &&
    locations.length === 1 &&
    !selectedLocation.isAddonSensor &&
    selectedLocation.type === SensorType.SENSOR
  ) {
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
          <div
            className={styles.selectionModal}
            {...(isTouchDevice()
              ? { onTouchStart: dismissSelectionModal }
              : { onMouseDown: dismissSelectionModal })}
          >
            <div className={styles.selectionContainer}>
              <PureSelectionHandler
                locations={locations}
                history={history}
                sensorReadings={sensorReadings}
                selectingOnly={selectingOnly}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
