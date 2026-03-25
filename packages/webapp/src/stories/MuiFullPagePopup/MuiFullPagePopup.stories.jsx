import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import decorator from '../Pages/config/Decorators';
import { Post } from '../Pages/LocationDetails/AreaDetails/AreaDetails.stories';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/MuiFullPagePopup',
  decorators: decorator,
  component: MuiFullPagePopup,
};

const Template = (args) => <MuiFullPagePopup {...args} />;

export const Area = Template.bind({});
Area.args = {
  open: true,
  children: <Post {...Post.args} />,
};
Area.parameters = {
  ...chromaticSmallScreen,
};
