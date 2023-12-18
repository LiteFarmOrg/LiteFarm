import { forwardRef } from 'react';
import DropdownButton from '../../components/Form/DropDownButton';
import FloatingMenu from '../../components/Menu/FloatingButtonMenu/FloatingMenu';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/DropdownButton',
  component: DropdownButton,
  decorators: componentDecorators,
};

const Template = (args) => <DropdownButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  options: [{ text: 'option1' }, { text: 'option2' }, { text: 'option3' }],
  children: 'Dropdown',
};

export const WithoutArrowIcon = {
  args: {
    options: [{ text: 'option1' }, { text: 'option2' }, { text: 'option3' }],
    children: 'Dropdown',
    noIcon: true,
  },
};

const Menu = forwardRef((props, ref) => (
  <FloatingMenu
    options={[
      { label: '+ Add revenue', onClick: () => console.log('Add revenue') },
      { label: '+ Add expense', onClick: () => console.log('Add Eepense') },
    ]}
    ref={ref}
  />
));
Menu.displayName = 'Menu';

export const WithCustomizedMenu = {
  args: {
    children: '+ Add transaction',
    type: 'v2',
    noIcon: true,
    Menu,
  },
};
