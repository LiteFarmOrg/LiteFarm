import React from 'react';
import ArchiveDocumentModal from '../../components/Modals/ArchiveDocumentModal';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/Modals/ArchiveDocumentModal',
  decorators: componentDecorators,
  component: ArchiveDocumentModal,
};

const Template = () => <ArchiveDocumentModal />;

export const Primary = Template.bind({});
