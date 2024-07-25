/*
 *  Copyright 2024 LiteFarm.org
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

import * as Sentry from '@sentry/react';
import { FallbackProps } from 'react-error-boundary';
import { logout } from '../../../util/jwt';
import { PureReactErrorFallback } from '../../../components/ErrorHandler/PureReactErrorFallback';

export default function ReactErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const handleErrorAction = (action: string, error: Error) => {
    Sentry.withScope((scope) => {
      scope.addBreadcrumb({
        category: 'error-action',
        message: `User chose to ${action} after an error`,
        level: Sentry.Severity.Info,
      });

      scope.setTags({ fallback_user_action: action });

      Sentry.captureException(error);
    });
  };

  const handleReload = async () => {
    handleErrorAction('reload', error);
    // Page reload interrupts the network request to Sentry, so we must wait for the Sentry action queue to complete (flush)
    await Sentry.flush();
    window.location.reload();
  };

  const handleLogout = () => {
    handleErrorAction('logout', error);
    resetErrorBoundary();
    logout();
  };

  return <PureReactErrorFallback handleReload={handleReload} handleLogout={handleLogout} />;
}
