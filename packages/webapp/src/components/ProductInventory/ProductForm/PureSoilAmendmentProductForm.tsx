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

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import Input, { getInputErrors } from '../../Form/Input';
import ProductDetails, { type ProductDetailsProps } from '../../Form/ProductDetails';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import { getSoilAmendmentFormValues } from '../../Form/ProductDetails/utils';
import { productDefaultValuesByType } from '../../../containers/ProductInventory/ProductForm/constants';
import { TASK_TYPES } from '../../../containers/Task/constants';
import { PRODUCT_FIELD_NAMES } from '../../Task/AddSoilAmendmentProducts/types';
import { type SoilAmendmentProduct } from '../../../store/api/types';
import { FormMode } from '../../../containers/ProductInventory';
import styles from '../styles.module.scss';

const { PRODUCT_ID, NAME } = PRODUCT_FIELD_NAMES;

type PureSoilAmendmentProductFormProps = ProductDetailsProps & {
  products: SoilAmendmentProduct[];
  mode: FormMode | null;
};

const PureSoilAmendmentProductForm = ({
  products,
  productId,
  mode,
  ...props
}: PureSoilAmendmentProductFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    reset,
    setValue,
    setFocus,
    trigger,
    formState: { errors },
  } = useFormContext();

  const product = productId
    ? products.find(({ product_id }) => productId === product_id)
    : undefined;

  useEffect(() => {
    if (product) {
      reset({
        [PRODUCT_ID]: product.product_id,
        [NAME]: product.name,
        ...getSoilAmendmentFormValues(product),
      });
      return;
    }

    reset(productDefaultValuesByType[TASK_TYPES.SOIL_AMENDMENT]);
  }, [product]);

  useEffect(() => {
    if (mode === FormMode.DUPLICATE) {
      setValue(PRODUCT_ID, '');
      setValue(NAME, t('common:COPY_OF', { item: product?.[NAME] }));
      trigger();

      setTimeout(() => {
        setFocus(NAME);
      }, 0);
    }
  }, [mode]);

  const productNames: SoilAmendmentProduct['name'][] = products.map(({ name }) => name);

  return (
    <div className={styles.soilAmendmentProductForm}>
      {/* @ts-expect-error */}
      <Input
        name={NAME}
        label={t('ADD_PRODUCT.PRODUCT_LABEL')}
        hookFormRegister={register(NAME, {
          required: true,
          maxLength: hookFormMaxCharsValidation(255),
          setValueAs: (value) => value.trim(),
          validate: (value) => {
            // Allow duplicate check to pass if keeping the original name during edit
            if (
              !(mode === FormMode.EDIT && value === product?.name) &&
              productNames.includes(value)
            ) {
              return t('ADD_TASK.DUPLICATE_NAME');
            }
          },
        })}
        disabled={props.isReadOnly}
        hasLeaf={true}
        errors={getInputErrors(errors, NAME)}
      />
      <ProductDetails {...props} />
    </div>
  );
};

export default PureSoilAmendmentProductForm;
