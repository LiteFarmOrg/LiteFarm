/*
 *  Copyright 2026 LiteFarm.org
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

import { useEffect, useState } from 'react';
import useMediaWithAuthentication from '../hooks/useMediaWithAuthentication';
import { isImageUrl } from '../../util/validation';
import SingleFilePicker, { OnFileUpload } from '../../components/SingleFilePicker';

interface AuthenticatedSingleFilePickerProps {
  label?: string;
  // The stored value's real URL (private-bucket, not directly fetchable unauthenticated) — not
  // what actually gets rendered, since that requires the resolution this component performs.
  value: string | null;
  onFileUpload: OnFileUpload;
  onRemoveImage: () => void;
  accept?: string;
  fileName?: string;
}

/**
 * For a SingleFilePicker whose value lives in a private bucket (needs an authenticated fetch —
 * see useMediaWithAuthentication — rather than a plain unauthenticated <img src>/upload-response
 * URL). Handles the two things that requires:
 *
 * 1. SingleFilePicker only reads defaultUrl once, at mount (useState(defaultUrl), no sync
 *    effect) — so it must not mount until the resolved mediaUrl actually reflects the current
 *    value, whether that's the initial load of an existing document or a URL that just changed
 *    after a new upload (which otherwise briefly shows SingleFilePicker's own unauthenticated
 *    raw-URL preview, set directly by useSingleFilePickerUpload's onUploadSuccess). Tracked
 *    against `value` itself, not useMediaWithAuthentication's own isLoading (which never resets
 *    after its first resolve), so the check is synchronous with the value change.
 * 2. The resolved mediaUrl is always an extension-less blob: URL, so SingleFilePicker's own
 *    image-vs-file-preview detection can't check it directly — check the real `value` instead.
 */
export default function AuthenticatedSingleFilePicker({
  label,
  value,
  onFileUpload,
  onRemoveImage,
  accept,
  fileName,
}: AuthenticatedSingleFilePickerProps) {
  const { mediaUrl } = useMediaWithAuthentication({ fileUrls: value ? [value] : [] });

  const [resolvedValue, setResolvedValue] = useState<string | null>(null);
  useEffect(() => {
    setResolvedValue(value);
  }, [mediaUrl]);

  if (value && value !== resolvedValue) {
    return null;
  }

  return (
    <SingleFilePicker
      label={label}
      defaultUrl={mediaUrl ?? ''}
      isDefaultUrlImage={value ? isImageUrl(value) : undefined}
      accept={accept}
      fileName={fileName}
      onFileUpload={onFileUpload}
      onRemoveImage={onRemoveImage}
    />
  );
}
