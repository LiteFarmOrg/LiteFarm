import { useTranslation } from 'react-i18next';
import Layout from '../../../components/Layout';
import Button from '../../../components/Form/Button';
import PageTitle from '../../../components/PageTitle/v2';
import { ReactComponent as DoesNotExistSplash } from '../../../assets/images/does-not-exist.svg';
import { Title } from '../../../components/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { ReactComponent as Sunglasses } from '../../../assets/images/miscs/smiling-face-with-sunglasses-emoji.svg';

const useStyles = makeStyles((theme) => ({
  line: {
    textAlign: 'center',
  },
}));

export default function UnknownRecord({ history }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Layout
      buttonGroup={
        <Button data-cy="recordNotFound-goBack" color={'primary'} fullLength>
          {t('common:BACK')}
        </Button>
      }
    >
      <PageTitle
        onGoBack={() => console.log('back')}
        style={{ marginBottom: '24px' }}
        title={t('UNKNOWN_RECORD.UNKNOWN_RECORD')}
      />
      <DoesNotExistSplash
        style={{
          width: '100%',
          height: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}
      />
      <Title className={classes.line}>{t('UNKNOWN_RECORD.CANT_FIND')}</Title>
      <Title className={classes.line}>
        {t('UNKNOWN_RECORD.MAYBE_LATER')}
        <Sunglasses />
      </Title>
    </Layout>
  );
}
