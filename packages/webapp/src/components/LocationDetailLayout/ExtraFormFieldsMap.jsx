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

import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import RadioGroup from '../Form/RadioGroup';
import { barnEnum } from '../../containers/constants';
import styles from './styles.module.scss';

function BarnDetailChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  return (
    <>
      <div>
        <div className={styles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.WASH_PACK')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.wash_and_pack}
            hookFormControl={control}
          />
        </div>
      </div>
      <div>
        <div className={styles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.COLD_STORAGE')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.cold_storage}
            hookFormControl={control}
          />
        </div>
      </div>
      <div>
        <div className={styles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.ANIMALS')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.used_for_animals}
            hookFormControl={control}
          />
        </div>
      </div>
    </>
  );
}

const ExtraLocationFormFieldsMap = {
  barn: BarnDetailChildren,
};

export default ExtraLocationFormFieldsMap;
