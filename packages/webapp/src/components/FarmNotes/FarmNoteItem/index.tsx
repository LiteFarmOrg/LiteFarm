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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { FarmNote } from '../types';
import styles from './styles.module.scss';

const isToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

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
  const { t } = useTranslation();
  const dateLabel = isToday(note.created_at) ? t('FARM_NOTE.TODAY') : formatDate(note.created_at);

  if (isExpanded) {
    return (
      <div className={clsx(styles.card, styles.expanded, note.to_sync && styles.pending)}>
        {/* Header row */}
        <div className={styles.expandedHeader}>
          <div className={styles.expandedHeaderLeft}>
            <button
              className={styles.chevronButton}
              onClick={onToggle}
              aria-label={t('FARM_NOTE.COLLAPSE')}
              type="button"
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </button>
            <div className={styles.authorRow}>
              <PeopleAltOutlinedIcon className={styles.authorIcon} fontSize="small" />
              <span className={styles.authorName}>{authorName}</span>
            </div>
          </div>
          <span className={styles.dateBadge}>{dateLabel}</span>
        </div>

        {/* Body */}
        <div className={styles.expandedBody}>
          {note.image_url && (
            <div className={styles.imageWrapper}>
              <img
                src={note.image_url}
                alt=""
                className={styles.thumbnail}
                onClick={() => onImageClick(note.image_url!)}
              />
              <button
                className={styles.enlargeLink}
                onClick={() => onImageClick(note.image_url!)}
                type="button"
              >
                <SearchIcon fontSize="small" />
                {t('FARM_NOTE.CLICK_TO_ENLARGE')}
              </button>
            </div>
          )}
          <p className={styles.noteText}>{note.note}</p>
        </div>

        {/* Author actions */}
        {isAuthor && (
          <div className={styles.actions}>
            <button className={styles.deleteButton} onClick={onDelete} type="button">
              <DeleteOutlineIcon fontSize="small" />
              {t('FARM_NOTE.DELETE_NOTE')}
            </button>
            <button className={styles.editButton} onClick={onEdit} type="button">
              <EditOutlinedIcon fontSize="small" />
              {t('FARM_NOTE.EDIT_NOTE')}
            </button>
          </div>
        )}

        {/* Pending sync label */}
        {note.to_sync && <span className={styles.pendingLabel}>{t('FARM_NOTE.PENDING_SYNC')}</span>}
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
      <div className={styles.collapsedMeta}>
        {note.is_private && <LockOutlinedIcon className={styles.lockIcon} fontSize="small" />}
        <span className={styles.authorName}>{authorName}</span>
      </div>
      <span className={styles.dateBadge}>{dateLabel}</span>
      <KeyboardArrowDownIcon className={styles.chevronInline} fontSize="small" />
    </button>
  );
}
