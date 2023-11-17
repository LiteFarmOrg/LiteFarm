/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import JSZip from 'jszip';
import { useEffect, useState } from 'react';
import { mediaEnum } from '../MediaWithAuthentication/constants';

export default function useMediaWithAuthentication({
  fileUrls = [],
  title = '',
  extensionName = '',
  mediaType = mediaEnum.IMAGE,
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

  return {
    mediaUrl,
    zipContent,
  };
}
