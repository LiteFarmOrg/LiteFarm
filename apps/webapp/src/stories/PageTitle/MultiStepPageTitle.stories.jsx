import React from 'react';
import MultiStepPageTitle from '../../components/PageTitle/MultiStepPageTitle';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/PageTitle/MultiStepPageTitle',
  component: MultiStepPageTitle,
  decorators: componentDecorators,
};

const Template = (args) => <MultiStepPageTitle {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'title',
  onCancel: () => {},
  onGoBack: () => {},
  value: 50,
};
export const Title = Template.bind({});
Title.args = {
  title: 'title',
};

export const WithoutCancel = Template.bind({});
WithoutCancel.args = {
  title: 'title',
  onGoBack: () => {},
};
