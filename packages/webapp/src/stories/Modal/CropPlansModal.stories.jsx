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
import CropPlansModal from '../../components/Modals/CropModals/CropPlansModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';
import { managementPlanCardCommonArgs, planBaseContents } from '../constants';

export default {
  title: 'Components/Modals/CropPlansModal',
  decorators: componentDecorators,
  component: CropPlansModal,
};

const Template = (args) => <CropPlansModal {...args} />;

export const ModalWithTwoCard = Template.bind({});
ModalWithTwoCard.args = {
  ...managementPlanCardCommonArgs,
  managementPlanCardContents: [...Array(2)].map((item, index) => {
    return {
      ...planBaseContents,
      repetition_count: 2,
      repetition_number: index + 1,
      startDate: `0${index + 7}-01-2023`,
      endDate: `0${index + 8}-02-2023`,
    };
  }),
};

ModalWithTwoCard.parameters = {
  ...chromaticSmallScreen,
};

export const ModalWithManyCards = Template.bind({});
ModalWithManyCards.args = {
  ...managementPlanCardCommonArgs,
  managementPlanCardContents: [...Array(20)].map((item, index) => {
    return {
      ...planBaseContents,
      repetition_count: 20,
      repetition_number: index + 1,
      startDate: `08-${(index + 1).toString().padStart(2, '0')}-2023`,
      endDate: `08-${(index + 2).toString().padStart(2, '0')}-2023`,
    };
  }),
};
ModalWithManyCards.parameters = {
  ...chromaticSmallScreen,
};

export const ModalWithDeletedIteration = Template.bind({});
ModalWithDeletedIteration.args = {
  ...managementPlanCardCommonArgs,
  managementPlanCardContents: [...Array(4)].map((item, index) => {
    return {
      ...planBaseContents,
      repetition_count: 5,
      repetition_number: index + (index < 2 ? 1 : 2),
      startDate: `0${index + 7}-01-2023`,
      endDate: `0${index + 8}-02-2023`,
    };
  }),
};
ModalWithDeletedIteration.parameters = {
  ...chromaticSmallScreen,
};
