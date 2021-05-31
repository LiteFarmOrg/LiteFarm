import React from 'react';
import FullYearCalendarView from '../../../components/FullYearCalendar';
import decorator from '../config/decorators';

export default {
  title: 'Page/FullYearCalendar',
  component: FullYearCalendarView,
  decorators: decorator,
};

const Template = (args) => <FullYearCalendarView {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  stages: {
    seed: new Date(),
    germinate: 5,
    harvest: 290
  }
};
