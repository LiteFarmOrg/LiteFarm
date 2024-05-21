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

import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useExpandable from '../../Expandable/useExpandableItem';
import ProductCard, { type ProductCardProps } from './ProductCard';
import TextButton from '../../Form/Button/TextButton';
import { type Product } from './types';
import { defaultValues } from './ProductCard/ProductDetails';
import { ReactComponent as PlusCircleIcon } from '../../../assets/images/plus-circle.svg';
import styles from './styles.module.scss';

export type AddSoilAmendmentProductsProps = ProductCardProps & { products: Product[] };

const FIELD_NAME = 'soil_amendment_task_products';

const AddSoilAmendmentProducts = ({ products, ...props }: AddSoilAmendmentProductsProps) => {
  const { t } = useTranslation();
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: FIELD_NAME,
    control,
  });

  const productsOfType = useMemo(
    () => products.filter((product) => product.type === 'soil_amendment_task'),
    [products],
  );

  const { expandedIds, toggleExpanded, expand, unExpand } = useExpandable({
    isSingleExpandable: true,
  });

  const productsForTask = watch(FIELD_NAME);

  return (
    <>
      <div className={styles.products}>
        {fields.map((field, index) => {
          const namePrefix = `${FIELD_NAME}.${index}`;
          return (
            <ProductCard
              {...props}
              key={field.id}
              onRemove={index ? () => remove(index) : undefined}
              namePrefix={namePrefix}
              products={productsOfType}
              isExpanded={expandedIds.includes(field.id)}
              toggleExpanded={() => toggleExpanded(field.id)}
              unExpand={() => unExpand(field.id)}
              expand={() => expand(field.id)}
              productId={productsForTask[index]?.product_id}
              setProductId={(id: number | string | undefined) => {
                setValue(`${namePrefix}.product_id`, id);
              }}
            />
          );
        })}
      </div>
      <TextButton onClick={() => append(defaultValues)} className={styles.addAnotherProduct}>
        <PlusCircleIcon />
        {t('ADD_PRODUCT.ADD_ANOTHER_PRODUCT')}
      </TextButton>
    </>
  );
};

export default AddSoilAmendmentProducts;
