import React from 'react';
import FullMonthCalendarView from '../../../components/MonthCalendar';
import { componentDecorators } from '../config/Decorators';

export default {
  title: 'Components/FullMonthCalendar',
  component: FullMonthCalendarView,
  decorators: componentDecorators,
};

const Template = (args) => <FullMonthCalendarView {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  date: '07-30-2021',
  stage: 'harvest_date',
};
