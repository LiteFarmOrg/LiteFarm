import React from 'react';
import TextArea from '../../../components/Form/TextArea';
export default {
  title: 'Components/Input/TextArea',
  component: TextArea,
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <TextArea {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'default',
};
