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
import { FeedbackMessages } from './useServiceWorkerListener';

export const feedbackMessages: FeedbackMessages = {
  'tasks.create': {
    successMessage: i18n.t('message:TASK.CREATE.SYNC.SUCCESS'),
    errors: {
      409: i18n.t('message:TASK.SYNC.LOCATION_DELETED'),
    },
    syncErrorMessage: i18n.t('message:TASK.CREATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.complete': {
    successMessage: i18n.t('message:TASK.COMPLETE.SYNC.SUCCESS'),
    errors: {
      403: i18n.t('message:TASK.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
      409: i18n.t('message:TASK.SYNC.LOCATION_DELETED'),
    },
    syncErrorMessage: i18n.t('message:TASK.UPDATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.abandon': {
    successMessage: i18n.t('message:TASK.ABANDON.SYNC.SUCCESS'),
    errors: {
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
    },
    syncErrorMessage: i18n.t('message:TASK.UPDATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.update': {
    successMessage: i18n.t('message:TASK.UPDATE.SYNC.SUCCESS'),
    errors: {
      403: i18n.t('message:TASK.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
    },
    syncErrorMessage: i18n.t('message:TASK.UPDATE.SYNC.NETWORK_ERROR'),
  },
  'tasks.delete': {
    successMessage: i18n.t('message:TASK.DELETE.SYNC.SUCCESS'),
    errors: {
      404: i18n.t('message:TASK.SYNC.NOT_FOUND'),
    },
    syncErrorMessage: i18n.t('message:TASK.DELETE.SYNC.NETWORK_ERROR'),
  },
  'farm_notes.create': {
    successMessage: i18n.t('message:FARM_NOTE.SYNC.ADD.SUCCESS'),
    errors: {},
    syncErrorMessage: i18n.t('message:FARM_NOTE.SYNC.ADD.NETWORK_ERROR'),
  },
  'farm_notes.edit': {
    successMessage: i18n.t('message:FARM_NOTE.SYNC.EDIT.SUCCESS'),
    errors: {
      403: i18n.t('message:FARM_NOTE.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:FARM_NOTE.SYNC.NOT_FOUND'),
    },
    syncErrorMessage: i18n.t('message:FARM_NOTE.SYNC.EDIT.NETWORK_ERROR'),
  },
  'farm_notes.delete': {
    successMessage: i18n.t('message:FARM_NOTE.SYNC.DELETE.SUCCESS'),
    errors: {
      403: i18n.t('message:FARM_NOTE.SYNC.UNAUTHORIZED'),
      404: i18n.t('message:FARM_NOTE.SYNC.NOT_FOUND'),
    },
    syncErrorMessage: i18n.t('message:FARM_NOTE.SYNC.DELETE.NETWORK_ERROR'),
  },
  'farm_notes.patch': {
    successMessage: undefined,
    errors: null,
    syncErrorMessage: null,
  },
};
