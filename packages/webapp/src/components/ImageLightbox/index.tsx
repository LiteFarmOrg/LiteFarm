/*
 *  Copyright 2026 LiteFarm.org
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

import Dialog from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import TextButton from '../Form/Button/TextButton';
import { ReactComponent as CloseIcon } from '../../assets/images/lightbox-close-x-icon.svg';

export type ImageLightboxProps = {
  src: string;
  open: boolean;
  onClose: () => void;
};

export default function ImageLightbox({ src, open, onClose }: ImageLightboxProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      slotProps={{
        backdrop: { className: styles.backdrop },
      }}
      PaperProps={{
        className: styles.paper,
      }}
    >
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <img className={styles.image} src={src} alt="" />
          <TextButton
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label={t('FARM_NOTE.CLOSE')}
          >
            <span>{t('FARM_NOTE.CLOSE')}</span>
            <CloseIcon aria-hidden="true" />
          </TextButton>
        </div>
        {!isMobile && <p className={styles.escHint}>{t('FARM_NOTE.ESC_TO_CLOSE')}</p>}
      </div>
    </Dialog>
  );
}
