import Download from '../../assets/images/farmMapFilter/Download.svg';
import useMediaWithAuthentication from '../hooks/useMediaWithAuthentication';
import { mediaEnum } from './constants';

export function MediaWithAuthentication({
  fileUrls = [],
  title = '',
  extensionName = '',
  mediaType = mediaEnum.IMAGE,
  ...props
}) {
  const { mediaUrl, zipContent } = useMediaWithAuthentication({
    fileUrls,
    title,
    extensionName,
    mediaType,
  });

  const handleClick = () => {
    const element = document.createElement('a');
    element.href = mediaUrl;
    element.download = title;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleZipDownload = () => {
    const element = document.createElement('a');
    element.href = `data:application/zip;base64,${zipContent}`;
    element.download = title;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderMediaComponent = () => {
    switch (mediaType) {
      case mediaEnum.DOCUMENT: {
        return <Download onClick={handleClick} {...props} />;
      }
      case mediaEnum.ZIP:
        return <Download onClick={handleZipDownload} {...props} />;
      case mediaEnum.IMAGE:
      default: {
        return <img loading="lazy" src={mediaUrl} {...props} />;
      }
    }
  };

  return renderMediaComponent();
}
