import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { Main } from '../../Typography';
import { Loading } from '../../Loading/Loading';
import { Dialog } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  paper: (_props) => ({
    overflow: 'inherit',
  }),
}));

export default function LoadingMapModal({ isOpen }: { isOpen: boolean }) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Dialog PaperProps={{ className: classes.paper }} open={isOpen} scroll="paper">
      <div className={styles.container}>
        <Loading />
        <Main>{t('FARM_MAP.ASSETS_LOADING')}</Main>
      </div>
    </Dialog>
  );
}
