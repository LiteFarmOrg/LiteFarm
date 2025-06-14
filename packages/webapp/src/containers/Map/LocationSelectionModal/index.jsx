import useSelectionHandler from '../useSelectionHandler';
import styles from '../styles.module.scss';
import PureSelectionHandler from '../../../components/Map/SelectionHandler';
import { useSelector } from 'react-redux';
import { canShowSelectionSelector, mapLocationsSelector } from '../../mapSlice';
import { isTouchDevice } from '../../../util/device';

export default function LocationSelectionModal({ history, selectingOnly }) {
  const { dismissSelectionModal } = useSelectionHandler();
  const showSelection = useSelector(canShowSelectionSelector);
  const locations = useSelector(mapLocationsSelector);

  return (
    showSelection && (
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
            selectingOnly={selectingOnly}
          />
        </div>
      </div>
    )
  );
}
