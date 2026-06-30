/*
 *  Copyright 2023 LiteFarm.org
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
import CropSaleItem from '../../components/Forms/RevenueForm/CropSaleItem';
import { componentDecorators } from '../Pages/config/Decorators';
import { FormProvider, useForm } from 'react-hook-form';

const CropSaleItemWithHookForm = (props) => {
  const reactHookFormFunctions = useForm({ mode: 'onChange' });
  const { handleSubmit } = reactHookFormFunctions;
  return (
    <FormProvider {...reactHookFormFunctions}>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <CropSaleItem {...props} />
      </form>
    </FormProvider>
  );
};

export default {
  title: 'Components/CropSaleItem',
  component: CropSaleItemWithHookForm,
  decorators: componentDecorators,
};

const Template = (args) => <CropSaleItemWithHookForm {...args} />;
export const Primary = Template.bind({});

Primary.args = {
  cropVariety: {
    crop_variety_name: 'Gala',
    crop_translation_key: 'APPLE',
    crop_variety_photo_url:
      'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp',
  },
  cropVarietyId: '51cee7c8-58b9-11ee-8cb8-ce0b8496eaaa',
  system: 'metric',
  currency: '$',
  disabledInput: false,
};
