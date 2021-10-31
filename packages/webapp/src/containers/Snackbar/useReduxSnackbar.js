import { useDispatch, useSelector } from 'react-redux';
import { removeSnackbar, snackbarSelector } from './snackbarSlice';
import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';

export function useReduxSnackbar() {
  const dispatch = useDispatch();
  const notifications = useSelector(snackbarSelector);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const displayed = useRef(new Set());

  const storeDisplayed = (id) => {
    displayed.current.add(id);
  };

  const removeDisplayed = (id) => {
    displayed.current.delete(id);
  };

  useEffect(() => {
    notifications.forEach(({ key, message, options = {}, dismissed = false }) => {
      if (dismissed) {
        // dismiss snackbar using notistack
        closeSnackbar(key);
        return;
      }

      // do nothing if snackbar is already displayed
      if (displayed.current.has(key)) return;
      // display snackbar using notistack
      enqueueSnackbar(message, {
        key,
        persist: true,
        ...options,
        onClose: (event, reason, myKey) => {
          if (options.onClose) {
            options.onClose(event, reason, myKey);
          }
        },
        onExited: (event, myKey) => {
          // remove this snackbar from redux store
          dispatch(removeSnackbar(myKey));
          removeDisplayed(myKey);
        },
      });

      // keep track of snackbars that we've displayed
      storeDisplayed(key);
    });
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch]);
}
