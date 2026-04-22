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

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { ReactComponent as CalendarIcon } from '../../../assets/images/task/Calendar.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/edit-02.svg';
import { ReactComponent as TrashIcon } from '../../../assets/images/trash-03.svg';
import { ReactComponent as LockIcon } from '../../../assets/images/icon-privacy.svg';
import { ReactComponent as PhotoIcon } from '../../../assets/images/imageCapture/photo-btn.svg';
import TextButton from '../../Form/Button/TextButton';
import Button from '../../Form/Button';
import useMediaWithAuthentication from '../../../containers/hooks/useMediaWithAuthentication';
import { isSameDay, getIntlDate } from '../../../util/date-migrate-TS';
import { FarmNote } from '../../../store/api/types';
import styles from './styles.module.scss';

interface FarmNoteItemProps {
  note: FarmNote;
  authorName: string;
  isAuthor: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: (src: string) => void;
}

export default function FarmNoteItem({
  note,
  authorName,
  isAuthor,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onImageClick,
}: FarmNoteItemProps) {
  const { t } = useTranslation(['translation', 'common']);
  const { mediaUrl: authenticatedImageUrl } = useMediaWithAuthentication({
    fileUrls: note?.image_url ? [note.image_url] : [],
  });
  const metaDataProps = {
    authorName: authorName,
    isPrivate: note.is_private,
    updatedAt: note.updated_at,
    isExpanded,
    hasImage: !!note.image_url,
  };

  if (isExpanded) {
    return (
      <div className={clsx(styles.card, styles.expanded, note.to_sync && styles.pending)}>
        {/* Header row */}
        <button onClick={onToggle} type="button" className={styles.expandedHeader}>
          <NoteMetaData {...metaDataProps} />
        </button>

        {/* Body */}
        <div className={styles.expandedBody}>
          <p className={styles.noteText}>{note.note}</p>
          {authenticatedImageUrl && (
            <div className={styles.imageWrapper}>
              <img
                src={authenticatedImageUrl}
                alt=""
                className={styles.thumbnail}
                onClick={() => onImageClick(authenticatedImageUrl)}
              />
              <TextButton
                className={styles.enlargeLink}
                onClick={() => onImageClick(authenticatedImageUrl)}
              >
                <SearchIcon fontSize="small" />
                {t('common:CLICK_TO_ENLARGE')}
              </TextButton>
            </div>
          )}
        </div>

        {/* Author actions */}
        {isAuthor && (
          <div className={styles.actions}>
            <Button color="link-btn" type="button" onClick={onDelete} sm>
              <TrashIcon />
              <span>{t('translation:FARM_NOTE.DELETE_NOTE')}</span>
            </Button>
            <Button color="secondary" type="button" onClick={onEdit} sm>
              <EditIcon />
              <span>{t('translation:FARM_NOTE.EDIT_NOTE')}</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={clsx(styles.card, styles.collapsed, note.to_sync && styles.pending)}
      onClick={onToggle}
      type="button"
    >
      <span className={styles.notePreview}>{note.note}</span>
      <NoteMetaData {...metaDataProps} />
    </button>
  );
}

interface NoteMetaDataProps {
  authorName: string;
  isPrivate: boolean;
  updatedAt: string;
  isExpanded: boolean;
  hasImage: boolean;
}

const NoteMetaData = ({
  authorName,
  isPrivate,
  updatedAt,
  isExpanded,
  hasImage,
}: NoteMetaDataProps) => {
  return (
    <span className={clsx(styles.noteMeta, isExpanded && styles.isExpanded)}>
      {isExpanded ? (
        <KeyboardArrowUpIcon className={clsx(styles.chevronUp, styles.chevron)} fontSize="small" />
      ) : (
        <KeyboardArrowDownIcon
          className={clsx(styles.chevronDown, styles.chevron)}
          fontSize="small"
        />
      )}
      <span className={styles.nameAndIcons}>
        <span className={styles.authorName}>{authorName}</span>
        <span className={styles.icons}>
          {isPrivate && <LockIcon />}
          {hasImage && (
            <span className={styles.photoIcon}>
              <PhotoIcon />
            </span>
          )}
        </span>
      </span>
      <DateBadge updatedAt={updatedAt} />
    </span>
  );
};

const DateBadge = ({ updatedAt }: { updatedAt: string }) => {
  const { t } = useTranslation('common');
  const isUpdatedToday = isSameDay(new Date(updatedAt), new Date());

  if (isUpdatedToday) {
    return <span className={styles.today}>{t('common:TODAY')}</span>;
  }

  return (
    <span className={styles.date}>
      <CalendarIcon />
      {getIntlDate(updatedAt)}
    </span>
  );
};
