import Card from './index';
import { ReactComponent as Star } from '../../assets/images/signUp/new_feature.svg';
import { Main, Text } from '../Typography';
import styles from '../Typography/typography.module.scss';
import { useTranslation } from 'react-i18next';
import { colors } from '../../assets/theme';

export function NewReleaseCard({ style }) {
  const { t } = useTranslation();
  return (
    <Card
      color={'info'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        ...style,
      }}
    >
      <Star />
      <Main style={{ color: colors.teal700, margin: '12px 0' }}>
        {t('SIGNUP.LITEFARM_UPDATED')}
      </Main>
      <Text style={{ margin: 0 }}>
        {t('SIGNUP.CHANGES')}{' '}
        <a
          href={'https://www.litefarm.org/post/litefarm-now-heavy-with-features'}
          className={styles.underlined}
        >
          {t('common:HERE')}
        </a>
        .
      </Text>
    </Card>
  );
}
