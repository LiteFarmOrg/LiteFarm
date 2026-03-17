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

import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useExpandable from '../../Expandable/useExpandableItem';
import FarmNoteItem from '../FarmNoteItem';
import { FarmNote } from '../types';
import styles from './styles.module.scss';

interface FarmNoteListProps {
  notes: FarmNote[];
  users: Record<string, string>;
  currentUserId: string;
  onAddNote: () => void;
  onEditNote: (note: FarmNote) => void;
  onDeleteNote: (note: FarmNote) => void;
  onImageClick: (src: string) => void;
}

export default function FarmNoteList({
  notes,
  users,
  currentUserId,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onImageClick,
}: FarmNoteListProps) {
  const { t } = useTranslation();
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });

  // Pending (offline-queued) notes render above server-fetched notes
  const pendingNotes = notes.filter((n) => n.to_sync);
  const serverNotes = notes.filter((n) => !n.to_sync);
  const orderedNotes = [...pendingNotes, ...serverNotes];

  return (
    <div className={styles.container}>
      <button className={styles.addButton} onClick={onAddNote} type="button">
        <AddCircleOutlineIcon fontSize="small" />
        {t('FARM_NOTE.ADD_A_NOTE')}
      </button>

      {orderedNotes.length === 0 ? (
        <p className={styles.emptyState}>{t('FARM_NOTE.EMPTY_STATE')}</p>
      ) : (
        <ul className={styles.list}>
          {orderedNotes.map((note) => (
            <li key={note.farm_note_id} className={styles.listItem}>
              <FarmNoteItem
                note={note}
                authorName={users[note.user_id] ?? ''}
                isAuthor={note.user_id === currentUserId}
                isExpanded={expandedIds.includes(note.farm_note_id)}
                onToggle={() => toggleExpanded(note.farm_note_id)}
                onEdit={() => onEditNote(note)}
                onDelete={() => onDeleteNote(note)}
                onImageClick={onImageClick}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
