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
import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetSoilAmendmentFertiliserTypesQuery } from '../../../store/api/apiSlice';
import PureSoilAmendmentProductForm from '../../../components/ProductInventory/ProductForm/PureSoilAmendmentProductForm';
import { userFarmSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { makeFilteredProductsSelector } from '../../productSlice';
import { TASK_TYPES } from '../../Task/constants';
import { FormMode } from '..';
import { FormContentProps } from '.';

const productsSelectorArgs = { type: TASK_TYPES.SOIL_AMENDMENT };

export default function SoilAmendmentProductForm({ mode, productId }: FormContentProps) {
  const { t } = useTranslation();

  const { data: fertiliserTypes = [] } = useGetSoilAmendmentFertiliserTypesQuery();
  // @ts-expect-error - Selector return empty object without property
  const { country_id } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);

  // t('ADD_PRODUCT.DRY_FERTILISER')
  // t('ADD_PRODUCT.LIQUID_FERTILISER')
  const fertiliserTypeOptions = fertiliserTypes.map(({ id, key }) => ({
    value: id,
    label: t(`ADD_PRODUCT.${key}_FERTILISER`),
  }));

  const productsSelector = useMemo(() => makeFilteredProductsSelector(), []);
  const soilAmendmentProducts = useSelector((state) =>
    /* @ts-expect-error https://github.com/reduxjs/reselect/issues/550#issuecomment-999701108 */
    productsSelector(state, productsSelectorArgs),
  );

  const isReadOnly = mode === FormMode.READ_ONLY;

  return (
    <PureSoilAmendmentProductForm
      mode={mode}
      isReadOnly={isReadOnly}
      farm={{ farm_id, interested, country_id }}
      fertiliserTypeOptions={fertiliserTypeOptions}
      products={soilAmendmentProducts}
      productId={productId}
    />
  );
}
