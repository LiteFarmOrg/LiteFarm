import { useState } from 'react';
import clsx from 'clsx';
import Tab from '../../components/RouterTab/Tab';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as TasksIcon } from '../../assets/images/nav/tasks.svg';
import styles from './styles.module.scss';

export default {
  title: 'Components/Tab',
  component: Tab,
  decorators: componentDecorators,
};

const tabs = [
  { label: 'Detail', path: '/detail' },
  { label: 'Crop', path: '/crop' },
  { label: 'User', path: '/user' },
];

const Template = (args) => {
  const [selectedtab, setSelectedTab] = useState(args.tabs[0].path);

  return (
    <Tab
      {...args}
      onClick={args.isSelected ? args.onClick : (tab) => setSelectedTab(tab.path)}
      isSelected={args.isSelected || ((tab) => tab.path === selectedtab)}
    />
  );
};
export const PillLeft = Template.bind({});
PillLeft.args = {
  tabs,
  isSelected: (tab) => tab.path === '/detail',
  onClick: (tab) => console.log(tab.path),
};

export const PillMiddle = Template.bind({});
PillMiddle.args = {
  tabs,
  isSelected: (tab) => tab.path === '/crop',
  onClick: (tab) => console.log(tab.path),
};

export const Underline = Template.bind({});
Underline.args = {
  tabs: [
    { label: 'Basic info', path: '/1' },
    { label: 'Tasks', path: '/2' },
  ],
  variant: 'underline',
  className: styles.underlineContainerDesktop,
};

export const UnderlineFourTabs = Template.bind({});
UnderlineFourTabs.args = {
  tabs: [
    { label: 'Basic info', path: '/1' },
    { label: 'Tasks', path: '/2' },
    { label: 'Groups', path: '/3' },
    { label: 'Timeline', path: '/4' },
  ],
  variant: 'underline',
  className: styles.underlineContainerDesktop,
};

export const FormattedLabel = Template.bind({});
FormattedLabel.args = {
  tabs: [
    { label: 'Basic info', path: '/1' },
    {
      label: 'Tasks',
      path: '/2',
      format: (tab, isSelected) => (
        <span className={styles.taskLabel}>
          <TasksIcon className={styles.taskLabelIcon} />
          <span>{tab.label}</span>
          <span className={clsx(styles.number, isSelected && styles.selected)}>4</span>
        </span>
      ),
    },
    { label: 'Groups', path: '/3' },
    { label: 'Timeline', path: '/4' },
  ],
  variant: 'underline',
  className: styles.underlineContainerDesktop,
};

export const UnderlineFourTabsMobile = Template.bind({});
UnderlineFourTabsMobile.args = {
  tabs: [
    { label: 'Basic info', path: '/1' },
    { label: 'Tasks', path: '/2' },
    { label: 'Groups', path: '/3' },
    { label: 'Timeline', path: '/4' },
  ],
  variant: 'underline',
};
