import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    left: '13px',
    top: '0px',
    width: '14px',
    height: '14px',
    padding: '4px',
    borderRadius: '25px',
    fontFamily: '"Open Sans"," SansSerif", serif',
    fontWeight: 700,
    fontSize: '8px',
    lineHeight: '18px',
    display: 'inline-flex',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    color: 'white',
    backgroundColor: '#D02620',
  },
});

export default function PureAlert({ alertCount }) {
  const classes = useStyles();
  return (
    alertCount && (
      <div className={clsx(classes.container)}>{alertCount <= 9 ? alertCount : '9+'}</div>
    )
  );
}

PureAlert.propTypes = {
  alertCount: PropTypes.number.isRequired,
};
