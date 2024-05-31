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

import { useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useExpandable from '../../Expandable/useExpandableItem';
import ProductCard, { type ProductCardProps } from './ProductCard';
import TextButton from '../../Form/Button/TextButton';
import { type Product } from './types';
import { defaultValues } from './ProductCard/ProductDetails';
import { ReactComponent as PlusCircleIcon } from '../../../assets/images/plus-circle.svg';
import { TASK_TYPES } from '../../../containers/Task/constants';
import styles from './styles.module.scss';

export type AddSoilAmendmentProductsProps = ProductCardProps & { products: Product[] };

type ProductId = 'number' | 'string';

interface ProductFields {
  product_id: ProductId;
}

const FIELD_NAME = 'soil_amendment_task_products';

const AddSoilAmendmentProducts = ({ products, ...props }: AddSoilAmendmentProductsProps) => {
  const [invalidProducts, setInvalidProducts] = useState<string[]>([]);

  const { t } = useTranslation();
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: FIELD_NAME,
    control,
  });

  const productsOfType = useMemo(
    () => products.filter((product) => product.type === TASK_TYPES.SOIL_AMENDMENT),
    [products],
  );

  const { expandedIds, toggleExpanded, expand, unExpand, resetExpanded } = useExpandable({
    isSingleExpandable: true,
  });

  const productsForTask = watch(FIELD_NAME);

  const getAvailableProductOptions = (selectedProductId: ProductId) => {
    // Returns the products that have not been selected by any other select
    const otherSelectedProductIds = productsForTask
      .filter(({ product_id }: ProductFields): boolean => product_id !== selectedProductId)
      .map(({ product_id }: ProductFields): ProductId => product_id);

    return productsOfType.filter(({ product_id }) => !otherSelectedProductIds.includes(product_id));
  };

  const getInvalidProductsUpdater = (fieldId: string) => (isValid: boolean) => {
    setInvalidProducts((prevState) => {
      if (isValid && prevState.includes(fieldId)) {
        return prevState.filter((id) => id !== fieldId);
      }
      if (!isValid && !prevState.includes(fieldId)) {
        return [...prevState, fieldId];
      }
      return prevState;
    });
  };

  const onRemove = (index: number, fieldId: string): void => {
    if (invalidProducts.includes(fieldId)) {
      setInvalidProducts(invalidProducts.filter((id) => id !== fieldId));
    }
    remove(index);
  };

  const onAddAnotherProduct = () => {
    resetExpanded();
    append(defaultValues);
  };

  return (
    <>
      <div className={styles.products}>
        {fields.map((field, index) => {
          const namePrefix = `${FIELD_NAME}.${index}`;
          const productId = productsForTask[index]?.product_id;

          return (
            <ProductCard
              {...props}
              key={field.id}
              onRemove={index ? () => onRemove(index, field.id) : undefined}
              namePrefix={namePrefix}
              products={getAvailableProductOptions(productId)}
              isExpanded={expandedIds.includes(field.id)}
              toggleExpanded={() => toggleExpanded(field.id)}
              unExpand={() => unExpand(field.id)}
              expand={() => expand(field.id)}
              productId={productId}
              setProductId={(id: number | string | undefined) => {
                setValue(`${namePrefix}.product_id`, id);
              }}
              setFieldValidity={getInvalidProductsUpdater(field.id)}
            />
          );
        })}
      </div>
      <TextButton
        disabled={!!invalidProducts.length}
        onClick={onAddAnotherProduct}
        className={styles.addAnotherProduct}
      >
        <PlusCircleIcon />
        {t('ADD_PRODUCT.ADD_ANOTHER_PRODUCT')}
      </TextButton>
    </>
  );
};

export default AddSoilAmendmentProducts;
