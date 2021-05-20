import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import React from 'react';
import { Label } from '../../Typography';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  blackBackground: {
    position: 'fixed',
    zIndex: 1299,
    left: 0,
    right: 0,
    top: '196px',
    bottom: 0,
    backgroundColor: 'rgba(25, 25, 40, 0.8)',
    [theme.breakpoints.up('sm')]: {
      top: '204px',
    },
    [theme.breakpoints.up('md')]: {
      top: '212px',
    },
  },
}));
export default function CropCatalogSearchAndFilterModal({ dismissModal }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('CROP_CATALOGUE.LETS_BEGIN')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} sm>
            {t('common:GOT_IT')}
          </Button>
        </>
      }
      backgroundDiv={
        <>
          <div
            onClick={dismissModal}
            style={{
              position: 'fixed',
              zIndex: 1300,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: 'rgba(25, 25, 40, 0)',
            }}
          />
          <div className={classes.blackBackground} />
        </>
      }
    >
      <>
        <Label style={{ paddingBottom: '16px' }}>{t('CROP_CATALOGUE.SELECT_A_CROP')}</Label>
      </>
    </ModalComponent>
  );
}
