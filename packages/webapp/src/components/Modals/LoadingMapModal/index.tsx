/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

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
