/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
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
  const goBack = () => {
    if (history.action === 'POP') {
      history.push('/home');
      return;
    } else {
      history.back();
    }
  };

  return (
    <Layout
      buttonGroup={
        <Button
          data-cy="recordNotFound-goBack"
          color={'primary'}
          fullLength
          onClick={() => {
            goBack();
          }}
        >
          {t('common:BACK')}
        </Button>
      }
    >
      <PageTitle
        onGoBack={goBack}
        style={{ marginBottom: '24px' }}
        title={t('UNKNOWN_RECORD.UNKNOWN_RECORD')}
      />
      <DoesNotExistSplash
        style={{
          maxHeight: '65vh',
          width: '100%',
          height: '100%',
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
