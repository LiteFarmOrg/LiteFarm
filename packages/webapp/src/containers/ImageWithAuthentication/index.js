import { useEffect, useState } from 'react';

export function ImageWithAuthentication({ src, ...props }) {
  const [imageSrc, setImageSrc] = useState();
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
        const url = new URL(src);
        url.hostname = 'images.litefarm.workers.dev';
        const response = await fetch(url.toString(), config);
        const image = await response.blob();
        subscribed && setImageSrc(URL.createObjectURL(image));
      } catch (e) {
        console.log(e);
      }
    };
    getImageSrc();
    return () => (subscribed = false);
  }, []);
  return <img loading="lazy" src={imageSrc} {...props} />;
}
