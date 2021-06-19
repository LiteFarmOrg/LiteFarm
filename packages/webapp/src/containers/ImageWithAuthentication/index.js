import { useEffect, useState } from 'react';
import { fetchFile } from './utils';

export function ImageWithAuthentication({ src, ...props }) {
  const [imageSrc, setImageSrc] = useState();
  useEffect(() => {
    let subscribed;
    const getImageSrc = async () => {
      try {
        subscribed = true;
        const response = await fetchFile(src);
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
