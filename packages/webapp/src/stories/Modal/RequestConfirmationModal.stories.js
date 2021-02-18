import React from 'react';
import RequestConfirmationModal from '../../components/Modals/RequestConfirmationModal';

export default {
  title: 'Components/Modals/RequestConfirmationModal',
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
  component: RequestConfirmationModal,
};

const Template = (args) => <RequestConfirmationModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
