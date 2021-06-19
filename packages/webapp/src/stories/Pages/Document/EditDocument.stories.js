import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import decorator from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/Document/EditDocument',
  component: PureDocumentDetailView,
  decorators: decorator,
};

const Template = (args) => <PureDocumentDetailView {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  handleSubmit: () => {},
  onGoBack: () => {},
  deleteImage: () => {},
  useHookFormPersist: () => ({
    persistedData: {
      uploadedFiles: [
        {
          url: 'https://litefarm.nyc3.digitaloceanspaces.com/default_crop/default.jpg',
          thumbnail_url: 'https://litefarm.nyc3.digitaloceanspaces.com/default_crop/default.jpg',
        },
      ],
    },
  }),
  imageComponent: (props) => <img {...props} />,
  isEdit: true
};

Primary.parameters = { ...chromaticSmallScreen };
