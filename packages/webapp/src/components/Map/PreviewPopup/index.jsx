import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../assets/theme';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
  },
  arrow: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    top: '35%',
    left: '40%',
    marginTop: -30,
    borderWidth: '10px 10px 10px 10px',
    borderBottomColor: 'white',
  },
  tooltip: {
    marginTop: 30,
    pointerEvents: 'initial',
    backgroundColor: 'white',
    boxShadow: '2px 6px 12px rgba(102, 115, 138, 0.2)',
    padding: 0,
    borderRadius: '4px',
    maxWidth: '264px',
    textAlign: 'left',
    userSelect: 'none',
    color: colors.grey900,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: 'Open Sans, SansSerif, serif',
  },
  body: {
    position: 'relative',
    padding: 5,
  },
}));

export default function PurePreviewPopup({ location, history }) {
  const classes = useStyles();

  const loadEditView = (location) => {
    // TODO history push the sensor detailed page
  };

  return (
    <div onClick={() => loadEditView(location)} className={classes.container}>
      <div className={classes.tooltip}>
        <div className={classes.arrow} />
        <div className={classes.body}>preview body</div>
      </div>
    </div>
  );
}

PurePreviewPopup.prototype = {
  location: PropTypes.object,
  history: PropTypes.func,
};
