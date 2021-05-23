import React from 'react';
import PageTitle from '../../components/PageTitle/v2';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/PageTitle',
  component: PageTitle,
  decorators: decorator,
};

const Template = (args) => <PageTitle {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'title',
  onCancel: () => {},
  onGoBack: () => {},
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
