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
import ProductDetails, { type StandaloneProductDetailsProps } from '../../Form/ProductDetails';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import { getSoilAmendmentFormValues } from '../../Form/ProductDetails/utils';
import { productDefaultValuesByType } from '../../../containers/ProductInventory/ProductForm/constants';
import { TASK_TYPES } from '../../../containers/Task/constants';
import { type SoilAmendmentProduct } from '../../../store/api/types';
import styles from '../styles.module.scss';

const PRODUCT_NAME = 'name';

type PureSoilAmendmentProductFormProps = StandaloneProductDetailsProps & {
  products: SoilAmendmentProduct[];
};

const PureSoilAmendmentProductForm = ({
  products,
  productId,
  ...props
}: PureSoilAmendmentProductFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    reset,
    formState: { errors },
  } = useFormContext();

  const product = productId
    ? products.find(({ product_id }) => productId === product_id)
    : undefined;

  useEffect(() => {
    if (product) {
      reset({
        product_id: product.product_id,
        name: product.name,
        ...getSoilAmendmentFormValues(product),
      });
      return;
    }

    reset(productDefaultValuesByType[TASK_TYPES.SOIL_AMENDMENT]);
  }, [product]);

  const productNames: SoilAmendmentProduct['name'][] = products.map(({ name }) => name);

  return (
    <div className={styles.soilAmendmentProductForm}>
      {/* @ts-expect-error */}
      <Input
        name={PRODUCT_NAME}
        label={t('ADD_PRODUCT.PRODUCT_LABEL')}
        hookFormRegister={register(PRODUCT_NAME, {
          required: true,
          maxLength: hookFormMaxCharsValidation(255),
          validate: (value) => {
            // Allow duplicate check to pass if keeping the original name during edit
            if (value !== product?.name && productNames.includes(value.trim())) {
              return t('ADD_TASK.DUPLICATE_NAME');
            }
          },
        })}
        disabled={props.isReadOnly}
        hasLeaf={true}
        errors={getInputErrors(errors, PRODUCT_NAME)}
      />
      <ProductDetails {...props} />
    </div>
  );
};

export default PureSoilAmendmentProductForm;
