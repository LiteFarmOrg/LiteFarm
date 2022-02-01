import React from 'react';
import { ContainerWithIcon } from '../../components/ContainerWithIcon/ContainerWithIcon';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as TrashIcon } from '../../assets/images/document/trash.svg';

export default {
  title: 'Components/ContainerWithIcon',
  component: ContainerWithIcon,
  decorators: componentDecorators,
};

const Template = (args) => <ContainerWithIcon {...args} />;

export const Image = Template.bind({});
Image.args = {
  icon: <TrashIcon />,
  onIconClick: () => {
    console.log('delete');
  },
  children: (
    <img src={`https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp`} />
  ),
};

export const RedBlock = Template.bind({});
RedBlock.args = {
  icon: <TrashIcon />,
  onIconClick: () => {
    console.log('delete');
  },
  children: <div style={{ backgroundColor: 'red', width: '100px', height: '100px' }} />,
  iconBackgroundColor: 'blue',
};
