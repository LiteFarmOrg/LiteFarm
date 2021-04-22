import React from 'react';
import PureSlider from '../../../components/Form/Slider/TimeSlider';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Slider',
  component: PureSlider,
  decorators: componentDecorators,
};

const Template = (args) => <PureSlider {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Duration',
  setValue: () => {}
};

