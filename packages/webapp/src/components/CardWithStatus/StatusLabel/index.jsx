import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { colors } from '../../../assets/theme';
import { Link } from 'react-router-dom';
import { ReactComponent as ExternalLinkIcon } from '../../../assets/images/icon_external_link.svg';
import styles from './styles.module.scss';
import clsx from 'clsx';

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px 8px',
    height: '24px',
    fontFamily: '"Open Sans", "SansSerif", serif, "Manjari"',
    color: 'white',
    fontWeight: 700,
    borderRadius: '4px',
  },
  active: {
    backgroundColor: colors.brightGreen700,
  },
  planned: {
    backgroundColor: colors.brown700,
  },
  completed: {
    backgroundColor: colors.teal900,
  },
  late: {
    backgroundColor: colors.red700,
  },
  abandoned: {
    backgroundColor: colors.grey600,
  },
  disabled: {
    backgroundColor: colors.grey200,
    color: colors.grey600,
  },
  forReview: {
    backgroundColor: colors.brightGreen700,
  },
  sm: {
    height: '16px',
    fontSize: '11px',
  },
});

export const StatusLabel = ({ color = 'active', label, sm, children, ...props }) => {
  const classes = useStyles();
  return (
    <div
      data-cy="status-label"
      className={clsx(classes.container, classes[color], sm && classes.sm)}
      {...props}
    >
      {label}
      {children}
    </div>
  );
};

export const StatusLabelLinkProps = {};

export const StatusLabelLink = ({ taskId, ...props }) => {
  return (
    <Link className={styles.link} to={{ pathname: `/task/${taskId}/read_only` }}>
      <StatusLabel {...props}>
        <ExternalLinkIcon />
      </StatusLabel>
    </Link>
  );
};

StatusLabel.propTypes = {
  color: PropTypes.oneOf(['active', 'planned', 'late', 'completed', 'abandoned', 'disabled']),
  label: PropTypes.string,
  sm: PropTypes.bool,
};

StatusLabelLink.propTypes = {
  color: PropTypes.oneOf(['active', 'planned', 'late', 'completed', 'abandoned', 'disabled']),
  label: PropTypes.string,
  sm: PropTypes.bool,
};
