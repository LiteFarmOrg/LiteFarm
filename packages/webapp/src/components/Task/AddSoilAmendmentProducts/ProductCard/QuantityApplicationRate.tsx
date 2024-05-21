/*
 *  Copyright 2024 LiteFarm.org
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

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import StateTab from '../../../RouterTab/StateTab';
import Unit from '../../../Form/Unit';
import { area_total_area, soilAmounts } from '../../../../util/convert-units/unit';
import styles from '../styles.module.scss';

export type QuantityApplicationRateProps = {
  namePrefix: string;
  system: 'metric' | 'imperial';
  isReadOnly: boolean;
  totalArea: number;
};

enum Tabs {
  QUANTITY = 'QUANTITY',
  APPLICATION_RATE = 'APPLICATION_RATE',
}

const METRIC = 'metric';

const TOTAL_AREA = `total_area`;
const TOTAL_AREA_UNIT = `total_area_unit`;
const APPLICATION_RATE = `application_rate`;
const APPLICATION_RATE_UNIT = `application_rate_unit`;

const QuantityApplicationRate = ({
  namePrefix,
  system,
  isReadOnly,
  totalArea,
}: QuantityApplicationRateProps) => {
  const { t } = useTranslation(['translation', 'common']);
  const { getValues, setValue, watch, control, register } = useFormContext();
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.QUANTITY);

  const PRODUCT_QUANTITY = `${namePrefix}.product_quantity`;
  const PRODUCT_QUANTITY_UNIT = `${namePrefix}.product_quantity_unit`;
  const PRODUCT_QUANTITY_UNIT_READ_ONLY = `${namePrefix}.product_quantity_unit_read_only`;

  const productQuantity = watch(PRODUCT_QUANTITY);
  const applicationRate = watch(APPLICATION_RATE);

  useEffect(() => {
    // TODO: update application rate
  }, [productQuantity]);

  useEffect(() => {
    // TODO: update quantity
  }, [applicationRate]);

  const commonInputProps = {
    hookFormSetValue: setValue,
    hookFormGetValue: getValues,
    hookFromWatch: watch,
    register,
    control,
    system,
    disabled: isReadOnly,
  };

  return (
    <div className={styles.section}>
      {/* @ts-ignore */}
      <StateTab
        tabs={[
          { key: Tabs.QUANTITY, label: t('common:QUANTITY') },
          { key: Tabs.APPLICATION_RATE, label: t('ADD_PRODUCT.APPLICATION_RATE') },
        ]}
        state={activeTab}
        setState={setActiveTab}
        variant="plane"
      />

      <div className={clsx(styles.sectionBody, styles.border)}>
        {activeTab === Tabs.QUANTITY && (
          <>
            {/* @ts-ignore */}
            <Unit
              {...commonInputProps}
              label={t('ADD_PRODUCT.QUANTITY_TO_APPLY')}
              name={PRODUCT_QUANTITY}
              displayUnitName={PRODUCT_QUANTITY_UNIT}
              unitType={soilAmounts}
              required
              hasLeaf
              placeholder={t('ADD_PRODUCT.QUANTITY_PLACEHOLDER')}
            />
          </>
        )}
        {activeTab === Tabs.APPLICATION_RATE && (
          <>
            {/* TODO: support application rate units */}
            {/* @ts-ignore */}
            {/* <Unit
              {...commonInputProps}
              label={t('ADD_PRODUCT.APPLICATION_RATE')}
              name={APPLICATION_RATE}
              displayUnitName={APPLICATION_RATE_UNIT}
              unitType={applicationRate}
              hasLeaf
              placeholder={t('ADD_PRODUCT.ENTER_APPLICATION_RATE')}
              to={system === METRIC ? 'kg/ha' : 'lb/ac'}
            /> */}
            <div className={styles.applicationRateDisabledFields}>
              {/* @ts-ignore */}
              <Unit
                {...commonInputProps}
                label={t('ADD_PRODUCT.TOTAL_AREA')}
                name={TOTAL_AREA}
                displayUnitName={TOTAL_AREA_UNIT}
                unitType={area_total_area}
                disabled={true}
                defaultValue={totalArea}
                to={system === METRIC ? 'ha' : 'ac'}
              />
              {/* TODO: support volume */}
              {/* @ts-ignore */}
              <Unit
                {...commonInputProps}
                label={t('ADD_PRODUCT.QUANTITY_TO_APPLY')}
                name={PRODUCT_QUANTITY}
                displayUnitName={PRODUCT_QUANTITY_UNIT_READ_ONLY}
                unitType={soilAmounts}
                required
                disabled={true}
                to={system === METRIC ? 'kg' : 'lb'}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuantityApplicationRate;
