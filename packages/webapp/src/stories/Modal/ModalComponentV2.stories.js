import React from 'react';
import ModalComponent from '../../components/Modals/ModalComponent/v2';
import { componentDecorators } from '../Pages/config/decorators';
import { Label } from '../../components/Typography';
import Button from '../../components/Form/Button';

export default {
  title: 'Components/Modals/ModalComponentV2',
  decorators: componentDecorators,
  component: ModalComponent,
};

const Template = (args) => <ModalComponent {...args} />;

export const Warning = Template.bind({});
Warning.args = {
  title: 'Unable to retire',
  contents: [
    'All crops and tasks associated with Field 1 need to be expired in order to retire the location.',
  ],
  warning: true,
};
Warning.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Primary = Template.bind({});
Primary.args = {
  title: 'Unable to retire',
  contents: [
    'All crops and tasks associated with Field 1 need to be expired in order to retire the location.',
  ],
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Children = Template.bind({});
Children.args = {
  title: 'Unable to retire',
  children: (
    <Label>
      All crops and tasks associated with Field 1 need to be expired in order to retire the
      location.
    </Label>
  ),
  buttonGroup: <Button sm>Click</Button>,
};
Children.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
