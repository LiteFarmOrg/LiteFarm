import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { colors } from '../../../assets/theme';
import { locationImgMap } from '../../Map/LocationMapping';
import styles from '../../../containers/Map/styles.module.scss';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  rowContainer: {
    '&:hover': {
      backgroundColor: colors.green100,
    },
    backgroundColor: 'white',
    color: colors.grey900,
    marginBottom: '5px',
  },
  selectedRowContainer: {
    '&:hover': {
      backgroundColor: colors.green100,
      color: colors.grey900,
    },
    backgroundColor: colors.green200,
    color: colors.grey900,
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 4,
    width: '100%',
    height: '100%',
  },
}));

export default function PureMapLocationSelectionModal({
  locations,
  onSelect,
  dismissSelectionModal,
  selectedLocationIds = [],
}) {
  const classes = useStyles();
  return (
    <div className={classes.container} onClick={dismissSelectionModal}>
      <div className={styles.selectionContainer}>
        {locations.map((location, idx) => {
          const { type, name, location_id } = location;
          return (
            <div
              key={idx}
              onClick={() => onSelect(location_id)}
              className={clsx(
                classes.rowContainer,
                selectedLocationIds.includes(location_id) && classes.selectedRowContainer,
              )}
            >
              <div
                data-cy="locationPicker-location"
                style={{ float: 'left', paddingTop: '8px', paddingLeft: '20px' }}
              >
                {' '}
                {locationImgMap[type]}{' '}
              </div>
              <div data-cy="locationPicker-locationName" style={{ padding: '12px 20px 10px 55px' }}>
                {name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

PureMapLocationSelectionModal.prototype = {
  locations: PropTypes.array,
  onSelect: PropTypes.func,
  dismissSelectionModal: PropTypes.func,
  selectedLocationIds: PropTypes.arrayOf(PropTypes.string),
};
