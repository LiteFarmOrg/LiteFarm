import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import AdjustAreaModal from '../../components/Map/Modals/AdjustArea';

export default {
  title: 'Components/Modals/AdjustAreaModal',
  decorators: componentDecorators,
  component: AdjustAreaModal,
};

const Template = (args) => <AdjustAreaModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { disable: true },
};
