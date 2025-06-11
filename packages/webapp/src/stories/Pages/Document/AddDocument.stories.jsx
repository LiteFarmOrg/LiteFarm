import PureDocumentDetailView from '../../../components/Documents/Add';
import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import { AddLink } from '../../../components/Typography';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import { DocumentUploader } from '../../../containers/Documents/DocumentUploader';

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
  isEdit: false,
  isUploading: false,
  filePickerFunctions: {
    deleteImage: () => {},
    imageComponent: (props) => <MediaWithAuthentication {...props} />,
    documentUploader: (props) => <DocumentUploader {...props} />,
    onUpload: () => {},
    onUploadEnd: () => {},
  },
};

export const uploadingImage = Template.bind({});
uploadingImage.args = {
  handleSubmit: () => {},
  onGoBack: () => {},
  onCancel: () => {},
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
  isEdit: false,
  isUploading: true,
  filePickerFunctions: {
    deleteImage: () => {},
    imageComponent: (props) => <MediaWithAuthentication {...props} />,
    documentUploader: (props) => <DocumentUploader {...props} />,
    onUpload: () => {},
    onUploadEnd: () => {},
  },
};

Primary.parameters = { ...chromaticSmallScreen };
