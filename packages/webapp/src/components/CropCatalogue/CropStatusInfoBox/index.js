import { makeStyles } from '@material-ui/core/styles';

import PropTypes from 'prop-types';

import { Text, Underlined } from '../../Typography';
import clsx from 'clsx';
import Card from '../../Card';
import { useTranslation } from 'react-i18next';
import Square from '../../Square';
import NativeDatePickerWrapper from '../../Form/NativeDatePicker/NativeDatePickerWrapper';
import moment from 'moment';
import { getDateInputFormat } from '../../LocationDetailLayout/utils';
import { getLanguageFromLocalStorage } from '../../../util';

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
  const onDateChange = (e) => setDate?.(e.target.value);

  return (
    <Card color={'info'} className={clsx(classes.container)} {...props}>
      <NativeDatePickerWrapper
        style={{
          position: 'absolute',
          right: '0',
          transform: 'translateX(-12px)',
        }}
        value={date}
        onChange={onDateChange}
      >
        <Underlined>{t('common:EDIT_DATE')}</Underlined>
      </NativeDatePickerWrapper>
      <Text>
        {t('CROP_CATALOGUE.CROP_STATUS')}{' '}
        <span className={classes.semibold}>
          {moment(date).locale(getLanguageFromLocalStorage()).format('MMMM DD, YYYY')}
        </span>{' '}
      </Text>
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
            <Square color={'past'}>{status.past}</Square>
            {t('common:PAST')}
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
    planned: PropTypes.number,
    past: PropTypes.number,
  }),
};
