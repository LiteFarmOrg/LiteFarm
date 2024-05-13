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

import { Controller, useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowUp';
import { ReactComponent as RatioOptionIcon } from '../../../assets/images/ratio-option.svg';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import Input, { getInputErrors } from '../../Form/Input';
import TextButton from '../../Form/Button/TextButton';
import RadioGroup from '../../Form/RadioGroup';
import CompositionInputs from '../../Form/CompositionInputs';
import { NPK, UNIT, Unit } from '../../Form/CompositionInputs/NumberInputWithSelect';
import Buttons from './Buttons';
import { FIELD_NAMES } from './types';
import { CANADA } from '../AddProduct/constants';
import styles from './styles.module.scss';

const unitOptions = [
  { label: '%', value: Unit.PERCENT },
  { label: <RatioOptionIcon />, value: Unit.RATIO },
];

export type ProductDetailsProps = {
  isReadOnly: boolean;
  isExpanded: boolean;
  isProductEntered: boolean;
  isEditingProduct: boolean;
  toggleExpanded: () => void;
  onCancel: () => void;
  onEdit: () => void;
  farm: {
    country_id: number;
    interested: boolean;
  };
};

const ProductDetails = ({
  isReadOnly,
  isExpanded,
  isProductEntered,
  isEditingProduct,
  toggleExpanded,
  onCancel,
  onEdit,
  farm: { country_id, interested },
}: ProductDetailsProps) => {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors, isValid, isDirty },
  } = useFormContext();
  const inCanada = country_id === CANADA;
  const isDetailDisabled = isReadOnly || !isEditingProduct;

  return (
    <div
      className={clsx(
        styles.border,
        !isProductEntered && styles.disabled,
        isExpanded && styles.expanded,
        styles.productDetails,
      )}
    >
      <TextButton
        disabled={!isProductEntered}
        onClick={toggleExpanded}
        className={clsx(styles.productDetailsTitle)}
      >
        <span>{t('ADD_PRODUCT.PRODUCT_DETAILS')}</span>
        <KeyboardArrowDownIcon className={styles.expandIcon} />
      </TextButton>

      <Collapse id={'id'} in={isExpanded} timeout="auto" unmountOnExit>
        <div className={styles.sectionBody}>
          {/* @ts-ignore */}
          <Input
            name={FIELD_NAMES.SUPPLIER}
            label={t('ADD_PRODUCT.SUPPLIER_LABEL')}
            hookFormRegister={register(FIELD_NAMES.SUPPLIER, {
              required: interested,
              maxLength: 255,
            })}
            disabled={isDetailDisabled}
            hasLeaf={true}
            errors={getInputErrors(errors, FIELD_NAMES.SUPPLIER)}
            optional={!interested}
          />
          {interested && inCanada && (
            <div className={styles.permitedSubstance}>
              <InputBaseLabel hasLeaf label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.IS_PERMITTED')} />
              {/* @ts-ignore */}
              <RadioGroup
                hookFormControl={control}
                name={FIELD_NAMES.PERMITTED}
                required={true}
                disabled={isDetailDisabled}
                showNotSure
              />
            </div>
          )}

          <Controller
            name={FIELD_NAMES.COMPOSITION}
            control={control}
            rules={{
              validate: (value): boolean | string => {
                if (!value || value[UNIT] === Unit.RATIO) {
                  return true;
                }
                return (
                  (value[NPK.N] || 0) + (value[NPK.P] || 0) + (value[NPK.K] || 0) <= 100 ||
                  t('ADD_PRODUCT.NPK_ERROR')
                );
              },
            }}
            render={({ field, fieldState }) => {
              return (
                <CompositionInputs
                  unitOptions={unitOptions}
                  inputsInfo={[
                    { name: NPK.N, label: t('ADD_PRODUCT.NITROGEN') },
                    { name: NPK.P, label: t('ADD_PRODUCT.PHOSPHOROUS') },
                    { name: NPK.K, label: t('ADD_PRODUCT.POTASSIUM') },
                  ]}
                  disabled={isDetailDisabled}
                  error={fieldState.error?.message}
                  values={field.value}
                  onChange={(name, value) => {
                    field.onChange({ ...field.value, [name]: value });
                  }}
                  // onBlur needs to be passed manually
                  // https://stackoverflow.com/questions/61661432/how-to-make-react-hook-form-controller-validation-triggered-on-blur
                  onBlur={field.onBlur}
                />
              );
            }}
          />

          {!isReadOnly && (
            <Buttons
              isEditingProduct={isEditingProduct}
              isEditDisabled={!isProductEntered}
              isSaveDisabled={!(isDirty && isValid)}
              onCancel={onCancel}
              onEdit={onEdit}
            />
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ProductDetails;
