/*
 *  Copyright (c) 2023 LiteFarm.org
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
import UnableToDeleteConcurrencyModal from '../../components/Modals/UnableToDeleteConcurrencyModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/UnableToDeleteConcurrencyModal',
  decorators: componentDecorators,
  component: UnableToDeleteConcurrencyModal,
};

const Template = (args) => <UnableToDeleteConcurrencyModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
