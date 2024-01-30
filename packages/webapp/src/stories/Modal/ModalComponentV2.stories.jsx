import React from 'react';
import ModalComponent from '../../components/Modals/ModalComponent/v2';
import { componentDecorators } from '../Pages/config/Decorators';
import { Label } from '../../components/Typography';
import Button from '../../components/Form/Button';
import { chromaticSmallScreen } from '../Pages/config/chromatic';
import styles from '../../components/Modals/CancelFlowModal/styles.module.scss';
import Email from '../../assets/images/export/email/Email.svg?react';

export default {
  title: 'Components/Modals/ModalComponentV2',
  decorators: componentDecorators,
  component: ModalComponent,
};

const Template = (args) => <ModalComponent {...args} />;

export const Warning = Template.bind({});
Warning.args = {
  title: 'Cancel your management plan?',
  contents: ['Any information you’ve entered will be discarded. Do you want to proceed?'],
  warning: true,
  buttonGroup: (
    <>
      <>
        <Button className={styles.button} color={'secondary'} sm>
          {'No'}
        </Button>
        <Button className={styles.button} sm>
          {'Yes'}
        </Button>
      </>
    </>
  ),
};
Warning.parameters = {
  ...chromaticSmallScreen,
};

export const Error = Template.bind({});
Error.args = {
  title: 'Unable to retire',
  contents: [
    'All crops and tasks associated with Field 1 need to be expired in order to retire the location.',
  ],
  error: true,
};
Error.parameters = {
  ...chromaticSmallScreen,
};

export const Primary = Template.bind({});
Primary.args = {
  title: 'Link sent',
  contents: ['A link has been sent. Please check your email.'],
  icon: <Email />,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Children = Template.bind({});
Children.args = {
  title: 'Link sent',
  children: <Label>A link has been sent. Please check your email.</Label>,
  buttonGroup: <Button sm>Click</Button>,
  icon: <Email />,
};
Children.parameters = {
  ...chromaticSmallScreen,
};
