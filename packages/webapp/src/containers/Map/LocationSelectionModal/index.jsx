import useSelectionHandler from '../useSelectionHandler';
import styles from '../styles.module.scss';
import PureSelectionHandler from '../../../components/Map/SelectionHandler';
import React from 'react';
import { useSelector } from 'react-redux';
import { canShowSelectionSelector, mapLocationsSelector } from '../../mapSlice';
import PurePreviewPopup from '../../../components/Map/PreviewPopup';

export default function LocationSelectionModal({ history, selectingOnly }) {
  const { dismissSelectionModal } = useSelectionHandler();
  const showSelection = useSelector(canShowSelectionSelector);
  const locations = useSelector(mapLocationsSelector);
  if (showSelection && locations.length === 1 && locations[0].type === 'sensor') {
    return (
      <div className={styles.selectionModal} onClick={dismissSelectionModal}>
        <div className={styles.selectionContainer}>
          <PurePreviewPopup location={locations[0]} history={history} />
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
                selectingOnly={selectingOnly}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
