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

import { ReactNode } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { ReactComponent as CalendarIcon } from '../../../assets/images/task/Calendar.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/edit-02.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/images/animals/trash_icon_new.svg';
import TextButton from '../../Form/Button/TextButton';
import Button from '../../Form/Button';
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
  const metaDataProps = {
    authorName: authorName,
    isPrivate: note.is_private,
    updatedAt: note.updated_at,
    isExpanded,
  };

  if (isExpanded) {
    return (
      <div className={clsx(styles.card, styles.expanded, note.to_sync && styles.pending)}>
        {/* Header row */}
        <NoteMetaData
          {...metaDataProps}
          icon={
            <button
              className={clsx(styles.chevronButton, styles.chevron)}
              onClick={onToggle}
              aria-label={t('translation:FARM_NOTE.COLLAPSE')}
              type="button"
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </button>
          }
        />

        {/* Body */}
        <div className={styles.expandedBody}>
          <p className={styles.noteText}>{note.note}</p>
          {note.image_url && (
            <div className={styles.imageWrapper}>
              <img
                src={note.image_url}
                alt=""
                className={styles.thumbnail}
                onClick={() => onImageClick(note.image_url!)}
              />
              <TextButton
                className={styles.enlargeLink}
                onClick={() => onImageClick(note.image_url!)}
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
            <TextButton type="button" onClick={onDelete}>
              <DeleteIcon className={styles.deletIcon} />
              <span>{t('translation:FARM_NOTE.DELETE_NOTE')}</span>
            </TextButton>
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
      <p className={styles.notePreview}>{note.note}</p>
      <NoteMetaData
        {...metaDataProps}
        icon={
          <KeyboardArrowDownIcon
            className={clsx(styles.chevronInline, styles.chevron)}
            fontSize="small"
          />
        }
      />
    </button>
  );
}

interface NoteMetaDataProps {
  authorName: string;
  isPrivate: boolean;
  updatedAt: string;
  icon: ReactNode;
  isExpanded: boolean;
}

const NoteMetaData = ({
  authorName,
  isPrivate,
  updatedAt,
  icon,
  isExpanded,
}: NoteMetaDataProps) => {
  return (
    <div className={clsx(styles.noteMeta, isExpanded && styles.isExpanded)}>
      {icon}
      <div className={styles.nameAndVisibility}>
        <span className={styles.authorName}>{authorName}</span>
        {isPrivate && <LockOutlinedIcon className={styles.lockIcon} fontSize="small" />}
      </div>
      <DateBadge updatedAt={updatedAt} />
    </div>
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
