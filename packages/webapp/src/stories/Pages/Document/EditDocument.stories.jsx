import PureDocumentDetailView from '../../../components/Documents/Add';
import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import { DocumentUploader } from '../../../containers/Documents/DocumentUploader';

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
  isEdit: true,
  isUploading: false,
  filePickerFunctions: {
    deleteImage: () => {},
    imageComponent: (props) => <MediaWithAuthentication {...props} />,
    documentUploader: (props) => <DocumentUploader {...props} />,
    onUpload: () => {},
    onUploadEnd: () => {},
  },
};

Primary.parameters = { ...chromaticSmallScreen };
