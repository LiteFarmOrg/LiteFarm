import React from 'react';
import Rating from '../../components/Rating';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/Rating',
  component: Rating,
  decorators: componentDecorators,
};

const Template = (args) => <Rating {...args} />;
export const ZeroStar = Template.bind({});
ZeroStar.args = {
  stars: 0,
};

export const ThreeStar = Template.bind({});
ThreeStar.args = {
  stars: 3,
};

export const FiveStar = Template.bind({});
FiveStar.args = {
  stars: 5,
};
