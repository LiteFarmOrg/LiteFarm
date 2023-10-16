import { useEffect, useState } from 'react';
import { mediaEnum } from './constants';
import { ReactComponent as Download } from '../../assets/images/farmMapFilter/Download.svg';
import JSZip from 'jszip';

export function MediaWithAuthentication({
  fileUrls = [],
  title = '',
  extensionName = '',
  mediaType = mediaEnum.IMAGE,
  ...props
}) {
  const [mediaUrl, setMediaUrl] = useState();
  const [zipContent, setZipContent] = useState();
  useEffect(() => {
    const config = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('farm_token'),
      },
      responseType: 'arraybuffer',
      method: 'GET',
    };
    let subscribed;

    const fetchMediaUrls = async () => {
      try {
        subscribed = true;
        if (mediaType === mediaEnum.ZIP) {
          const zip = new JSZip();
          const folder = zip.folder(title);

          await Promise.all(
            fileUrls.map(async (fileUrl) => {
              const url = new URL(fileUrl);
              if (import.meta.env.VITE_ENV !== 'development') {
                url.hostname = 'images.litefarm.workers.dev';
              }
              return fetch(url.toString(), config).then((response) => {
                const blobFilePromise = response.blob();
                folder.file(url.href.substring(url.href.lastIndexOf('/')), blobFilePromise);
              });
            }),
          );
          const content = await zip.generateAsync({ type: 'base64' });
          subscribed && setZipContent(content);
        } else {
          const fileUrl = fileUrls[0];
          if (fileUrl) {
            if (import.meta.env.VITE_ENV === 'development') {
              subscribed && setMediaUrl(fileUrl);
            } else {
              const url = new URL(fileUrl);
              url.hostname = 'images.litefarm.workers.dev';
              const response = await fetch(url.toString(), config);
              const blobFile = await response.blob();
              subscribed && setMediaUrl(URL.createObjectURL(blobFile));
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchMediaUrls();
    return () => (subscribed = false);
  }, []);

  const handleClick = () => {
    const element = document.createElement('a');
    element.href = mediaUrl;
    element.download = `${title}.${extensionName}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleZipDownload = () => {
    const element = document.createElement('a');
    element.href = `data:application/zip;base64,${zipContent}`;
    element.download = `${title}.zip`;
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
