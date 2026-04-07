/*
 *  Copyright 2023-2026 LiteFarm.org
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

type MediaType = (typeof mediaEnum)[keyof typeof mediaEnum];

interface UseMediaWithAuthenticationParams {
  fileUrls?: string[];
  title?: string;
  mediaType?: MediaType;
}

interface UseMediaWithAuthenticationResult {
  mediaUrl: string | undefined;
  zipContent: string | undefined;
  isLoading: boolean;
}

export default function useMediaWithAuthentication({
  fileUrls = [],
  title = '',
  mediaType = mediaEnum.IMAGE,
}: UseMediaWithAuthenticationParams): UseMediaWithAuthenticationResult {
  const [mediaUrl, setMediaUrl] = useState<string>();
  const [zipContent, setZipContent] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const config: RequestInit = {
      headers: {
        Authorization: 'Bearer ' + (localStorage.getItem('farm_token') ?? ''),
      },
      method: 'GET',
    };

    let subscribed = true;

    const fetchMediaUrls = async () => {
      try {
        if (mediaType === mediaEnum.ZIP) {
          const zip = new JSZip();
          const folder = zip.folder(title);

          if (!folder) {
            return;
          }

          await Promise.all(
            fileUrls.map(async (fileUrl) => {
              const url = new URL(fileUrl);

              if (import.meta.env.VITE_ENV !== 'development') {
                url.hostname = 'images.litefarm.workers.dev';
              }

              const response = await fetch(url.toString(), config);
              const blobFilePromise = response.blob();
              folder.file(url.href.substring(url.href.lastIndexOf('/')), blobFilePromise);
            }),
          );

          const content = await zip.generateAsync({ type: 'base64' });
          if (subscribed) {
            setZipContent(content);
          }
        } else {
          const fileUrl = fileUrls[0];

          if (!fileUrl) {
            return;
          }

          if (import.meta.env.VITE_ENV === 'development') {
            if (subscribed) {
              setMediaUrl(fileUrl);
            }
          } else {
            const url = new URL(fileUrl);
            url.hostname = 'images.litefarm.workers.dev';

            const response = await fetch(url.toString(), config);
            const blobFile = await response.blob();

            if (subscribed) {
              setMediaUrl(URL.createObjectURL(blobFile));
            }
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaUrls();

    return () => {
      subscribed = false;
    };
  }, []);

  return {
    mediaUrl,
    zipContent,
    isLoading,
  };
}
