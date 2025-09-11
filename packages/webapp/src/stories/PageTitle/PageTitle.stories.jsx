import React from 'react';
import PageTitle from '../../components/PageTitle/v2';
import decorator from '../Pages/config/Decorators';

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
  onCancel: undefined,
};

export const WithLabelAndSubText = Template.bind({});
WithLabelAndSubText.args = {
  title: 'title',
  subtext: (
    <p style={{ textAlign: 'right', color: '#359D92' }}>Revised on April 9 by Dominique B.</p>
  ),
  label: (
    <span
      style={{
        background: '#359D92',
        color: '#fff',
        borderRadius: '2px',
        height: '28px',
        padding: '8px',
        fontWeight: 600,
        fontSize: '12px',
        lineHeight: '12px',
      }}
    >
      Completed
    </span>
  ),
  onGoBack: () => {},
  onCancel: undefined,
};
