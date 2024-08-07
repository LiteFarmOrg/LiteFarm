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

import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useExpandable from '../../Expandable/useExpandableItem';
import ProductCard, { type ProductCardProps } from './ProductCard';
import TextButton from '../../Form/Button/TextButton';
import { Label } from '../../Typography';
import { type ProductId, TASK_PRODUCT_FIELD_NAMES } from './types';
import type { SoilAmendmentProduct } from '../../../store/api/types';
import { ReactComponent as PlusCircleIcon } from '../../../assets/images/plus-circle.svg';
import styles from './styles.module.scss';
import { Location } from './QuantityApplicationRate';

export type AddSoilAmendmentProductsProps = Pick<
  ProductCardProps,
  'isReadOnly' | 'farm' | 'system' | 'onSaveProduct' | 'productsVersion'
> & {
  products: SoilAmendmentProduct[];
  purposes?: { id: number; key: string }[];
  fertiliserTypes?: { id: number; key: string }[];
  locations: Location[];
};

interface ProductFields {
  product_id: ProductId;
}

const FIELD_NAME = 'soil_amendment_task_products';

export const defaultValues = {
  [TASK_PRODUCT_FIELD_NAMES.PRODUCT_ID]: '', // Using an empty string instead of undefined to avoid issues with append()
  [TASK_PRODUCT_FIELD_NAMES.PURPOSES]: [],
  [TASK_PRODUCT_FIELD_NAMES.OTHER_PURPOSE]: '',
  [TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED]: 100,
  [TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED]: NaN,
  [TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED_UNIT]: undefined,
  [TASK_PRODUCT_FIELD_NAMES.IS_WEIGHT]: true,
  [TASK_PRODUCT_FIELD_NAMES.WEIGHT]: NaN,
  [TASK_PRODUCT_FIELD_NAMES.WEIGHT_UNIT]: undefined,
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT]: NaN,
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT_UNIT]: undefined,
  [TASK_PRODUCT_FIELD_NAMES.VOLUME]: NaN,
  [TASK_PRODUCT_FIELD_NAMES.VOLUME_UNIT]: undefined,
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME]: NaN,
  [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME_UNIT]: undefined,
};

const AddSoilAmendmentProducts = ({
  products,
  purposes = [],
  fertiliserTypes = [],
  isReadOnly,
  locations,
  ...props
}: AddSoilAmendmentProductsProps) => {
  const { t } = useTranslation();
  const {
    control,
    setValue,
    watch,
    formState: { isValid },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: FIELD_NAME,
    control,
  });

  const { expandedIds, toggleExpanded, expand, unExpand, resetExpanded } = useExpandable({
    isSingleExpandable: true,
  });

  const productsForTask = watch(FIELD_NAME);

  const getAvailableProductOptions = (selectedProductId: ProductId): SoilAmendmentProduct[] => {
    // Returns the products that have not been selected by any other select
    const otherSelectedProductIds = productsForTask
      .filter(({ product_id }: ProductFields): boolean => product_id !== selectedProductId)
      .map(({ product_id }: ProductFields): ProductId => product_id);

    return products.filter(({ product_id }) => !otherSelectedProductIds.includes(product_id));
  };

  const productNames: SoilAmendmentProduct['name'][] = products.map(({ name }) => name);

  const onAddAnotherProduct = (): void => {
    resetExpanded();
    append(defaultValues);
  };

  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.STRUCTURE')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.MOISTURE_RETENTION')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.NUTRIENT_AVAILABILITY')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.PH')
  // t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER')
  const purposeOptions = purposes.map(({ id, key }) => ({
    value: id,
    label: t(`ADD_TASK.SOIL_AMENDMENT_VIEW.${key}`),
  }));

  // t('ADD_PRODUCT.DRY_FERTILISER')
  // t('ADD_PRODUCT.LIQUID_FERTILISER')
  const fertiliserTypeOptions = fertiliserTypes.map(({ id, key }) => ({
    value: id,
    label: t(`ADD_PRODUCT.${key}_FERTILISER`),
  }));

  const otherPurposeId = purposes.find(({ key }) => key === 'OTHER')?.id;

  return (
    <>
      <Label className={styles.productsInstruction}>
        {t(`ADD_PRODUCT.WHAT_YOU_WILL_BE_APPLYING`)}
      </Label>
      <div className={styles.products}>
        {fields.map((field, index) => {
          const namePrefix = `${FIELD_NAME}.${index}`;
          const productId = productsForTask[index]?.product_id;

          return (
            <ProductCard
              {...props}
              key={field.id}
              isReadOnly={isReadOnly}
              onRemove={fields.length > 1 ? () => remove(index) : undefined}
              namePrefix={namePrefix}
              products={getAvailableProductOptions(productId)}
              productNames={productNames}
              isExpanded={expandedIds.includes(field.id)}
              toggleExpanded={() => toggleExpanded(field.id)}
              unExpand={() => unExpand(field.id)}
              expand={() => expand(field.id)}
              productId={productId}
              setProductId={(id: ProductId) => {
                setValue(`${namePrefix}.product_id`, id, { shouldValidate: true });
              }}
              purposeOptions={purposeOptions}
              otherPurposeId={otherPurposeId}
              fertiliserTypeOptions={fertiliserTypeOptions}
              locations={locations}
            />
          );
        })}
      </div>
      {!isReadOnly && (
        <TextButton
          disabled={!isValid}
          onClick={onAddAnotherProduct}
          className={styles.addAnotherProduct}
        >
          <PlusCircleIcon />
          {t('ADD_PRODUCT.ADD_ANOTHER_PRODUCT')}
        </TextButton>
      )}
    </>
  );
};

export default AddSoilAmendmentProducts;
