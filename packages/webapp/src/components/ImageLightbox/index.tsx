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
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import TextButton from '../Form/Button/TextButton';
import CloseIcon from '../../assets/images/lightbox-close-x-icon.svg?react';
import getDeviceType from '../../util/getDeviceType';

export type ImageLightboxProps = {
  src: string;
  open: boolean;
  onClose: () => void;
};

export default function ImageLightbox({ src, open, onClose }: ImageLightboxProps) {
  const { t } = useTranslation();
  const isDesktopDevice = getDeviceType() === 'desktop';

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            aria-label={t('common:CLOSE')}
          >
            <span>{t('common:CLOSE')}</span>
            <CloseIcon aria-hidden="true" />
          </TextButton>
        </div>
        {isDesktopDevice && <p className={styles.escHint}>{t('IMAGE_LIGHTBOX.ESC_TO_CLOSE')}</p>}
      </div>
    </Dialog>
  );
}
