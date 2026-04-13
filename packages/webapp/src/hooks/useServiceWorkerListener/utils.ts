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

import i18n from '../../locales/i18n';

export type SyncArea =
  | 'tasks.create'
  | 'tasks.complete'
  | 'tasks.abandon'
  | 'tasks.update' // Generic fallback; use for patching date and assignee as well
  | 'tasks.delete'
  | 'farm_notes.create'
  | 'farm_notes.edit'
  | 'farm_notes.delete'
  | 'farm_notes.patch';

/**
 * Resolve specific kinds of task operations from the URL and HTTP method.
 */
export function resolveAreaFromUrl(method: string, url: string): SyncArea {
  if (method === 'POST' && url.includes('/farm_note')) {
    return 'farm_notes.create';
  }
  if (method === 'PATCH' && url.includes('/farm_note/')) {
    return 'farm_notes.edit';
  }
  if (method === 'DELETE' && url.includes('/farm_note/')) {
    return 'farm_notes.delete';
  }
  if (method === 'PATCH' && url.includes('/farm_notes_read')) {
    return 'farm_notes.patch';
  }

  // Tasks (existing logic)
  if (method === 'POST') {
    return 'tasks.create';
  }

  if (method === 'DELETE') {
    return 'tasks.delete';
  }

  if (url.includes('/task/complete/')) {
    return 'tasks.complete';
  }
  if (url.includes('/task/abandon/')) {
    return 'tasks.abandon';
  }

  return 'tasks.update';
}

export interface Messages {
  successMessage?: string | null;
  errors: Record<number, string> | null;
  retryMessage?: string | null;
}

export type FeedbackMessages = Record<SyncArea, Messages>;

export const getFeedbackMessages = (): FeedbackMessages => ({
  'tasks.create': {
    successMessage: i18n.t('message:TASK.CREATE.SYNC.SUCCESS'),
    errors: {
      409: i18n.t('message:TASK.SYNC.LOCATION_DELETED'),
    },
    retryMessage: i18n.t('message:TASK.CREATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.complete': {
    successMessage: i18n.t('message:TASK.COMPLETE.SYNC.SUCCESS'),
    errors: {
      403: i18n.t('message:TASK.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
      409: i18n.t('message:TASK.SYNC.LOCATION_DELETED'),
    },
    retryMessage: i18n.t('message:TASK.UPDATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.abandon': {
    successMessage: i18n.t('message:TASK.ABANDON.SYNC.SUCCESS'),
    errors: {
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
    },
    retryMessage: i18n.t('message:TASK.UPDATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.update': {
    successMessage: i18n.t('message:TASK.UPDATE.SYNC.SUCCESS'),
    errors: {
      403: i18n.t('message:TASK.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
    },
    retryMessage: i18n.t('message:TASK.UPDATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.delete': {
    successMessage: i18n.t('message:TASK.DELETE.SYNC.SUCCESS'),
    errors: {
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
    },
    retryMessage: i18n.t('message:TASK.DELETE.SYNC.NETWORK_ERROR'),
  },
  'farm_notes.create': {
    successMessage: i18n.t('message:FARM_NOTE.SYNC.ADD.SUCCESS'),
    errors: {},
    retryMessage: i18n.t('message:FARM_NOTE.SYNC.ADD.NETWORK_ERROR'),
  },
  'farm_notes.edit': {
    successMessage: i18n.t('message:FARM_NOTE.SYNC.EDIT.SUCCESS'),
    errors: {
      403: i18n.t('message:FARM_NOTE.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:FARM_NOTE.SYNC.NOT_FOUND'),
    },
    retryMessage: i18n.t('message:FARM_NOTE.SYNC.EDIT.NETWORK_ERROR'),
  },
  'farm_notes.delete': {
    successMessage: i18n.t('message:FARM_NOTE.SYNC.DELETE.SUCCESS'),
    errors: {
      403: i18n.t('message:FARM_NOTE.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:FARM_NOTE.SYNC.NOT_FOUND'),
    },
    retryMessage: i18n.t('message:FARM_NOTE.SYNC.DELETE.NETWORK_ERROR'),
  },
  'farm_notes.patch': {
    successMessage: null,
    errors: null,
    retryMessage: null,
  },
});
