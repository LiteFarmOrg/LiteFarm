import React from 'react';
import { authenticatedDecorators } from '../config/decorators';
import PureHelpRequestPage from "../../../components/Help";

export default {
  title: 'Form/Help/PureHelp',
  decorators: authenticatedDecorators,
  component: PureHelpRequestPage,
};

const Template = (args) => <PureHelpRequestPage {...args} />;

export const HelpMain = Template.bind({});
// HomeRain.args = {
//   title: 'Good morning, User Name',
//   children: <Rain {...Rain.args} />,
//   imgUrl:
//     'https://res.cloudinary.com/dfxanglyc/image/upload/v1552774058/portfolio/1024px-Nail___Gear.svg.png',
// };
// HomeRain.parameters = {
//   chromatic: { viewports: [320, 414, 768, 1024, 1800] },
// };
