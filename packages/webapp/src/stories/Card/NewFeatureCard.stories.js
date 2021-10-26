import React from 'react';
import { NewReleaseCard } from '../../components/Card/NewReleaseCard';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/NewReleaseCard',
  component: NewReleaseCard,
  decorators: componentDecorators,
};

const Template = (args) => <NewReleaseCard {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
  children: 'Primary',
};
