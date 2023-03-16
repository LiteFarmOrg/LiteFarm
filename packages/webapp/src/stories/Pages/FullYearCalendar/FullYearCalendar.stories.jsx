import React from 'react';
import FullYearCalendarView from '../../../components/FullYearCalendar';
import { componentDecorators } from '../config/Decorators';

export default {
  title: 'Components/FullYearCalendar',
  component: FullYearCalendarView,
  decorators: componentDecorators,
};

const Template = (args) => <FullYearCalendarView {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  seed_date: '06-01-2021',
  germination_date: '06-30-2021',
  harvest_date: '04-30-2022',
  transplant_date: '07-30-2021',
  initial: 'seed_date',
};
