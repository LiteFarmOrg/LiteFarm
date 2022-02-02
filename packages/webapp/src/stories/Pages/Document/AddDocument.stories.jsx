import React from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import { AddLink } from '../../../components/Typography';

export default {
  title: 'Page/Document/AddDocument',
  component: PureDocumentDetailView,
  decorators: decorator,
};

const Template = (args) => <PureDocumentDetailView {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  handleSubmit: () => {},
  onGoBack: () => {},
  onCancel: () => {},
  deleteImage: () => {},
  useHookFormPersist: () => ({
    persistedData: {
      uploadedFiles: [
        {
          url: 'https://litefarm.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp',
          thumbnail_url:
            'https://litefarm.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp',
        },
      ],
    },
  }),
  imageComponent: (props) => <img {...props} />,
  documentUploader: (props) => <AddLink {...props}>{props.linkText}</AddLink>,
  isEdit: true,
};

export const uploadingImage = Template.bind({});
uploadingImage.args = {
  handleSubmit: () => {},
  onGoBack: () => {},
  onCancel: () => {},
  deleteImage: () => {},
  useHookFormPersist: () => ({
    persistedData: {
      uploadedFiles: [
        {
          url: 'https://litefarm.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp',
          thumbnail_url:
            'https://litefarm.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp',
        },
      ],
    },
  }),
  imageComponent: (props) => <img {...props} />,
  documentUploader: (props) => <AddLink {...props}>{props.linkText}</AddLink>,
  isEdit: false,
};

Primary.parameters = { ...chromaticSmallScreen };
