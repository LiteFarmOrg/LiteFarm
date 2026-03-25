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
import useExpandable from '../../Expandable/useExpandableItem';
import FarmNoteItem from '../FarmNoteItem';
import Button from '../../Form/Button';
import { ReactComponent as PlusCircleIcon } from '../../../assets/images/plus-circle.svg';
import { FarmNote } from '../types';
import styles from './styles.module.scss';

interface FarmNoteListProps {
  notes: FarmNote[];
  userDisplayNameMap: Record<FarmNote['user_id'], string>;
  currentUserId: string;
  onAddNote: () => void;
  onEditNote: (note: FarmNote) => void;
  onDeleteNote: (note: FarmNote) => void;
  onImageClick: (src: string) => void;
}

export default function FarmNoteList({
  notes,
  userDisplayNameMap,
  currentUserId,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onImageClick,
}: FarmNoteListProps) {
  const { t } = useTranslation();
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });

  // Pending (offline-queued) notes render above server-fetched notes
  const pendingNotes = notes
    .filter((n) => n.to_sync)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const serverNotes = notes.filter((n) => !n.to_sync);
  const orderedNotes = [...pendingNotes, ...serverNotes];
  const isEmpty = orderedNotes.length === 0;

  return (
    <div className={clsx(styles.container, isEmpty && styles.emptyContainer)}>
      <div className={styles.header}>
        {isEmpty && <p className={styles.emptyState}>{t('FARM_NOTE.EMPTY_STATE')}</p>}
        <Button
          className={styles.addButton}
          color="secondary-2"
          type="button"
          onClick={onAddNote}
          sm
        >
          <PlusCircleIcon />
          {t('FARM_NOTE.ADD_A_NOTE')}
        </Button>
      </div>

      {!isEmpty && (
        <ul className={styles.list}>
          {orderedNotes.map((note) => {
            return (
              <li key={note.id}>
                <FarmNoteItem
                  note={note}
                  authorName={userDisplayNameMap[note.user_id]}
                  isAuthor={note.user_id === currentUserId}
                  isExpanded={expandedIds.includes(note.id)}
                  onToggle={() => toggleExpanded(note.id)}
                  onEdit={() => onEditNote(note)}
                  onDelete={() => onDeleteNote(note)}
                  onImageClick={onImageClick}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
