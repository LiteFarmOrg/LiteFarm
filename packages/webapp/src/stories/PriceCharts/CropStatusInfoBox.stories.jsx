import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import { PriceCropCharts } from '../../components/Insights/PriceCropCharts/PriceCropCharts';

export default {
  title: 'Components/PriceCropCharts',
  component: PriceCropCharts,
  decorators: componentDecorators,
};

const cropsWithPriceInfo = [
  {
    ALFALFA_FOR_FODDER: [
      {
        crop_date: '2022-01',
        crop_price: 0,
        network_price: 2,
      },
      {
        crop_date: '2022-02',
        crop_price: 5,
        network_price: 6,
      },
      {
        crop_date: '2022-03',
        crop_price: 0,
        network_price: 9,
      },
      {
        crop_date: '2022-04',
        crop_price: 0,
        network_price: 3,
      },
      {
        crop_date: '2022-05',
        crop_price: 0,
        network_price: 10,
      },
      {
        crop_date: '2022-06',
        crop_price: 0,
        network_price: 6,
      },
      {
        crop_date: '2022-07',
        crop_price: 0,
        network_price: 4,
      },
      {
        crop_date: '2022-08',
        crop_price: 0,
        network_price: 9,
      },
      {
        crop_date: '2022-09',
        crop_price: 0,
        network_price: 2,
      },
      {
        crop_date: '2022-10',
        crop_price: 0,
        network_price: 0.21428571428571427,
      },
      {
        crop_date: '2022-11',
        crop_price: 0,
        network_price: 27.66666666666667,
      },
      {
        crop_date: '2022-12',
        crop_price: 2.572063713692564,
        network_price: 4.11457020742577,
      },
      {
        crop_date: '2021-01',
        crop_price: 4.409235879422096,
        network_price: 11.841000480816383,
      },
      {
        crop_date: '2021-02',
        crop_price: 305.89130111278297,
        network_price: 131.06595463165482,
      },
    ],
  },
  {
    ALMOND: [
      {
        crop_date: '2022-12',
        crop_price: 3.00630723257394,
        network_price: 3.00630723257394,
      },
      {
        crop_date: '2022-01',
        crop_price: 3.00630723257394,
        network_price: 3.00630723257394,
      },
    ],
  },
];

const Template = (args) => <PriceCropCharts {...args} />;
export const Default = Template.bind({});
Default.args = {
  cropsWithPriceInfo,
  currencySymbol: '$',
  unit: 'mi',
  isImperial: true,
};

export const OneYear = Template.bind({});
OneYear.args = {
  cropsWithPriceInfo: [
    {
      ALMOND: [
        {
          crop_date: '2022-01',
          crop_price: 3.00630723257394,
          network_price: 3.00630723257394,
        },
      ],
    },
  ],
  currencySymbol: '$',
  isImperial: false,
};
