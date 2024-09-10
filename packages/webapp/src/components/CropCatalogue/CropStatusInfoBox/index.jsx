import { makeStyles } from '@mui/styles';

import PropTypes from 'prop-types';
import clsx from 'clsx';
import Card from '../../Card';
import { useTranslation } from 'react-i18next';
import Square from '../../Square';
import { getDateInputFormat } from '../../../util/moment';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    padding: '12px',
    position: 'relative',
    flexDirection: 'column',
    rowGap: '16px',
  },
  semibold: {
    fontWeight: 600,
  },
  secondRowContainer: {
    display: 'flex',
    gap: '10px',
  },
  cropCountContainer: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
});

export default function CropStatusInfoBox({
  status,
  date = getDateInputFormat(new Date()),
  setDate,
  ...props
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Card color={'info'} className={clsx(classes.container)} {...props}>
      {status && (
        <div className={classes.secondRowContainer}>
          <div className={classes.cropCountContainer}>
            <Square>{status.active}</Square>
            {t('common:ACTIVE')}
          </div>
          <div className={classes.cropCountContainer}>
            <Square color={'planned'}>{status.planned}</Square>
            {t('common:PLANNED')}
          </div>
          <div className={classes.cropCountContainer}>
            <Square color={'past'}>{status.completed + status.abandoned}</Square>
            {t('common:PAST')}
          </div>
          <div className={classes.cropCountContainer}>
            <Square color={'needsPlan'}>{status.noPlans}</Square>
            {t('common:NEEDS_PLAN')}
          </div>
        </div>
      )}
    </Card>
  );
}

CropStatusInfoBox.propTypes = {
  setDate: PropTypes.func,
  date: PropTypes.string,

  status: PropTypes.exact({
    active: PropTypes.number,
    abandoned: PropTypes.number,
    planned: PropTypes.number,
    completed: PropTypes.number,
    noPlans: PropTypes.number,
  }),
};
