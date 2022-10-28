import { useEffect, useState } from 'react';

export function DocumentWithAuthentication({ fileUrl, title, ...props }) {
  const [fileHref, setFileHref] = useState();
  useEffect(() => {
    const config = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('farm_token'),
      },
      responseType: 'arraybuffer',
      method: 'GET',
    };
    let subscribed;
    const getImageSrc = async () => {
      try {
        subscribed = true;
        const url = new URL(fileUrl);
        url.hostname = 'images.litefarm.workers.dev';
        const response = await fetch(url.toString(), config);
        const image = await response.blob();
        subscribed && setFileHref(URL.createObjectURL(image));
      } catch (e) {
        console.log(e);
      }
    };
    getImageSrc();
    return () => (subscribed = false);
  }, []);

  const handleClick = () => {
    const element = document.createElement('a');
    element.href = fileHref;
    element.download = title;
    document.body.appendChild(element);
    element.click();
  };
  return (
    <a onClick={handleClick} {...props}>
      Download
    </a>
  );
}
