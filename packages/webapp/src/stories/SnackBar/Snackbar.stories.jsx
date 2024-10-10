import React from 'react';
import { NotistackSnackbar } from '../../containers/Snackbar/NotistackSnackbar';
import decorator from '../Pages/config/Decorators';
import { SnackbarProvider, useSnackbar } from 'notistack';
import Layout from '../../components/Layout';
import PageTitle from '../../components/PageTitle/v2';
import Button from '../../components/Form/Button';
import { PureSnackbar } from '../../components/PureSnackbar';
import styles from './styles.module.scss';

export default {
  title: 'Components/Snackbar',
  component: NotistackSnackbar,
  decorators: decorator,
};

function Page() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <Layout buttonGroup={<Button fullLength>Dismiss</Button>}>
      <PageTitle title={'Snackbar'} />
      <Button
        onClick={() =>
          enqueueSnackbar('Upload success', {
            variant: 'common',
            key: `success-${new Date().getTime()}`,
          })
        }
      >
        Success
      </Button>
      <Button
        color={'secondary'}
        onClick={() =>
          enqueueSnackbar('Upload failed', {
            variant: 'common',
            key: `error-${new Date().getTime()}`,
          })
        }
      >
        Error
      </Button>
      <Button
        color={'secondary'}
        onClick={() =>
          enqueueSnackbar('Persist', {
            variant: 'common',
            key: `error-${new Date().getTime()}`,
            persist: true,
          })
        }
      >
        Persist
      </Button>
    </Layout>
  );
}

const Template = (args) => {
  return (
    <SnackbarProvider
      classes={{ root: styles.root, containerRoot: styles.root }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      Components={{ common: NotistackSnackbar }}
    >
      <Page />
    </SnackbarProvider>
  );
};
export const Primary = Template.bind({});
Primary.args = {};
const SnackBarTemplate = (args) => <PureSnackbar {...args} />;
export const Success = SnackBarTemplate.bind({});
Success.args = {
  type: 'success',
  message: 'success',
  onDismiss: () => {},
};

export const Error = SnackBarTemplate.bind({});
Error.args = {
  type: 'error',
  message: 'error',
  onDismiss: () => {},
};
