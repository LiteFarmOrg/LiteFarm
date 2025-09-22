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
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetSoilAmendmentFertiliserTypesQuery } from '../../../store/api/apiSlice';
import PureSoilAmendmentProductForm from '../../../components/ProductInventory/ProductForm/PureSoilAmendmentProductForm';
import { userFarmSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import {
  ProductId,
  ProductFormFields,
} from '../../../components/Task/AddSoilAmendmentProducts/types';

export default function SoilAmendmentProductForm() {
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

  return (
    <PureSoilAmendmentProductForm
      isReadOnly={false}
      isNestedForm={false}
      farm={{ farm_id, interested, country_id }}
      fertiliserTypeOptions={fertiliserTypeOptions}
      productId={'TODO'}
      clearProduct={() => console.log('Function not implemented.')}
      setProductId={(id: ProductId) => console.log('Function not implemented.')}
      onSave={async (
        data: ProductFormFields & { product_id: ProductId },
        callback?: (id: ProductId) => void,
      ) => console.log('Function not implemented.')}
    />
  );
}
