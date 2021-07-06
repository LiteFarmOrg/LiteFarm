import React from 'react';
import { NotistackSnackbar } from '../../containers/Snackbar/NotistackSnackbar';
import decorator from '../Pages/config/decorators';
import { SnackbarProvider, useSnackbar } from 'notistack';
import Layout from '../../components/Layout';
import PageTitle from '../../components/PageTitle/v2';
import Button from '../../components/Form/Button';
import { makeStyles } from '@material-ui/core/styles';

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
            persist: true,
            key: `success-${new Date().getTime()}`,
          })
        }
      >
        Success
      </Button>
      <Button
        color={'secondary'}
        onClick={() =>
          enqueueSnackbar('Upload success', {
            persist: true,
            key: `error-${new Date().getTime()}`,
          })
        }
      >
        Error
      </Button>
    </Layout>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 'calc(100vw - 48px)',
    maxWidth: '976px',
  },
}));

const Template = (args) => {
  const classes = useStyles();
  return (
    <SnackbarProvider
      classes={classes}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      content={(key, message) => <NotistackSnackbar id={key} message={message} />}
    >
      <Page />
    </SnackbarProvider>
  );
};
export const Primary = Template.bind({});
Primary.args = {};
