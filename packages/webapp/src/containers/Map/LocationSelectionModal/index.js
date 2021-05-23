import useSelectionHandler from '../useSelectionHandler';
import styles from '../styles.module.scss';
import PureSelectionHandler from '../../../components/Map/SelectionHandler';
import React from 'react';
import { useSelector } from 'react-redux';
import { canShowSelectionSelector, mapLocationsSelector } from '../../mapSlice';

export default function LocationSelectionModal({ history }) {
  const { dismissSelectionModal } = useSelectionHandler();
  const showSelection = useSelector(canShowSelectionSelector);
  const locations = useSelector(mapLocationsSelector);
  return (
    <>
      {showSelection && (
        <div className={styles.selectionModal} onClick={dismissSelectionModal}>
          <div className={styles.selectionContainer}>
            <PureSelectionHandler locations={locations} history={history} />
          </div>
        </div>
      )}
    </>
  );
}
