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

const getConfig = (): RequestInit => ({
  headers: { Authorization: 'Bearer ' + (localStorage.getItem('farm_token') ?? '') },
  method: 'GET',
});

// Fetches a single private-bucket file with the auth header and returns a local blob: URL for
// display. Exported as a plain function (not just inlined in the hook below) so it can also be
// called from outside a component's render — e.g. a callback that already has a fresh upload's
// URL and wants to resolve it once, immediately, without going through a hook.
export async function resolveAuthenticatedMediaUrl(fileUrl: string): Promise<string> {
  const url = new URL(fileUrl);
  if (import.meta.env.VITE_ENV !== 'development') {
    url.hostname = 'images.litefarm.workers.dev';
  }

  const response = await fetch(url.toString(), getConfig());
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export default function useMediaWithAuthentication({
  fileUrls = [],
  title = '',
  mediaType = mediaEnum.IMAGE,
}: UseMediaWithAuthenticationParams): UseMediaWithAuthenticationResult {
  const [mediaUrl, setMediaUrl] = useState<string>();
  const [zipContent, setZipContent] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const fileUrlsKey = fileUrls.join(',');

  useEffect(() => {
    let subscribed = true;
    let blobUrl: string | undefined;

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

              const response = await fetch(url.toString(), getConfig());
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
            setMediaUrl(undefined);
            return;
          }

          const nextBlobUrl = await resolveAuthenticatedMediaUrl(fileUrl);

          if (!subscribed) {
            URL.revokeObjectURL(nextBlobUrl);
            return;
          }

          blobUrl = nextBlobUrl;
          setMediaUrl(nextBlobUrl);
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
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fileUrlsKey]);

  return {
    mediaUrl,
    zipContent,
    isLoading,
  };
}
