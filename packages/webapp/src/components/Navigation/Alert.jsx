import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import AlertIcon from '../../assets/images/alert.svg';

export default function PureAlert({ alertCount }) {
  const useStyles = makeStyles({
    alert: {
      position: 'absolute',
      left: '13px',
      top: '2px',
      width: '12px',
      height: '12px',
    },
    alertCount: {
      fontFamily: '"Open Sans"," SansSerif", serif',
      fontWeight: 700,
      fontSize: '8px',
      textAlign: 'center',
      color: 'white',
    },
  });
  const classes = useStyles();

  return (
    alertCount && (
      <>
        <AlertIcon className={clsx(classes.alert)} />
        <div data-cy="notification-alert" className={clsx(classes.alert, classes.alertCount)}>
          {alertCount <= 9 ? alertCount : '9+'}
        </div>
      </>
    )
  );
}

PureAlert.propTypes = {
  alertCount: PropTypes.number.isRequired,
};
