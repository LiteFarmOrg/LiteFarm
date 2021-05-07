import { makeStyles } from '@material-ui/core/styles';

import PropTypes from 'prop-types';

import { Text, Underlined } from '../../Typography';
import clsx from 'clsx';
import Card from '../../Card';
import { useTranslation } from 'react-i18next';
import Square from '../../Square';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    padding: '12px',
    position: 'relative',
    minHeight: '75px',
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

export default function CropStatusInfoBox({ date, active = 0, planned = 0, past = 0, ...props }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Card color={'info'} className={clsx(classes.container)} {...props}>
      <Underlined
        style={{
          position: 'absolute',
          right: '0',
          transform: 'translate(-12px, 2px)',
        }}
      >
        {t('common:EDIT_DATE')}
      </Underlined>
      <Text>
        {t('CROP_CATALOG.CROP_STATUS')} <span className={classes.semibold}>{date}</span>{' '}
      </Text>
      <div className={classes.secondRowContainer}>
        <div className={classes.cropCountContainer}>
          <Square>{active}</Square>
          {t('common:ACTIVE')}
        </div>
        <div className={classes.cropCountContainer}>
          <Square color={'planned'}>{planned}</Square>
          {t('common:PLANNED')}
        </div>
        <div className={classes.cropCountContainer}>
          <Square color={'past'}>{past}</Square>
          {t('common:PAST')}
        </div>
      </div>
    </Card>
  );
}

CropStatusInfoBox.propTypes = {
  date: PropTypes.string,
  active: PropTypes.number,
  planned: PropTypes.number,
  past: PropTypes.number,
};
