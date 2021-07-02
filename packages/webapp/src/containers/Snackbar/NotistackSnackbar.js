import { forwardRef, useCallback } from 'react';
import { PureSnackbar } from '../../components/PureSnackbar';
import { useSnackbar } from 'notistack';

export const NotistackSnackbar = forwardRef(({ message, id }, ref) => {
  const { closeSnackbar } = useSnackbar();
  const onDismiss = useCallback(() => {
    closeSnackbar(id);
  }, [id, closeSnackbar]);

  return <PureSnackbar ref={ref} onDismiss={onDismiss} message={message} type={id.split('-')[0]} />;
});
