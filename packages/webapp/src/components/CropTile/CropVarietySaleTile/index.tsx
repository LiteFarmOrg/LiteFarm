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

import { useTranslation } from 'react-i18next';
import PureCropTile from '../index';
import styles from '../styles.module.scss';

export interface CropVarietySaleTileData {
  crop_variety_name: string;
  crop_translation_key: string;
  crop_variety_photo_url: string;
}

interface CropVarietySaleTileProps {
  cropVariety: CropVarietySaleTileData;
}

export default function CropVarietySaleTile({ cropVariety }: CropVarietySaleTileProps) {
  const { t } = useTranslation();
  const { crop_variety_name, crop_translation_key, crop_variety_photo_url } = cropVariety;
  const translatedCropName = t(`crop:${crop_translation_key}`);
  const title = crop_variety_name || translatedCropName;

  return (
    <PureCropTile src={crop_variety_photo_url} alt={title} title={title}>
      <span className={styles.cropSubtitle}>{translatedCropName}</span>
    </PureCropTile>
  );
}
