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
  // Method #2 -- assuming we want to track the user's interaction (reload or logout) in Sentry alongside the error
  // However note that the component stack is not present in the error object passed to the FallbackComponent AND this doesn't prevent the overall handler from sending an error; therefore I don't recommend this
  const handleErrorAction = (action: string, error: Error) => {
    Sentry.withScope((scope) => {
      scope.addBreadcrumb({
        category: 'error-action',
        message: `User chose to ${action} after an error`,
        level: Sentry.Severity.Info,
      });

      scope.setTags({ user_action: action });

      Sentry.captureException(error);
    });
  };

  // Method #3 -- My preferred option is to send the interaction to Sentry as a message (error details could be optionally appended to better match up the two events), and let the error handling in main.jsx capture the error as an exception
  const handleErrorActionMessage = (action: string, error: Error) => {
    Sentry.captureMessage(`User chose to ${action} after an error`, {
      level: Sentry.Severity.Info,
      tags: { user_action: action },
      extra: { error_message: error.message, error_stack: error.stack },
    });
  };

  const handleReload = async () => {
    handleErrorActionMessage('reload', error);
    // Page reload interrupts the network request to Sentry, so we must wait for the Sentry action queue to complete (flush)
    await Sentry.flush();
    window.location.reload();
  };

  const handleLogout = () => {
    handleErrorActionMessage('logout', error);
    resetErrorBoundary();
    logout();
  };

  return <PureReactErrorFallback handleReload={handleReload} handleLogout={handleLogout} />;
}
