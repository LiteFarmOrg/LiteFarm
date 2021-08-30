import React from 'react';
import MainDocumentView from '../../../components/Documents/Main';
import decorator from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/Document/MainDocument',
  component: MainDocumentView,
  decorators: decorator,
};

const Template = (args) => <MainDocumentView {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  onRetire: () => {},
  onUpdate: () => {},
  document: {
    name: 'Document Name',
    notes: `Lorem Ipsum dolorem`,
    valid_until: '2021-06-21',
    files: [
      {
        thumbnail_url: 'https://litefarm.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp',
      },
    ],
  },
  imageComponent: (props) => <img {...props} />,
  onGoBack: () => {},
};

Primary.parameters = { ...chromaticSmallScreen };
