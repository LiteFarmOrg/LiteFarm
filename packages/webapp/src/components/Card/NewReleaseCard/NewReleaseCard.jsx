import Card from '../index';
import { ReactComponent as Star } from '../../../assets/images/signUp/new_feature.svg';
import { Semibold, Text } from '../../Typography';
import typography from '../../Typography/typography.module.scss';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../../util/constants';

export function NewReleaseCard({ style }) {
  const { t } = useTranslation();
  return (
    <Card color={'info'} style={{ ...style }} className={styles.card}>
      <Star />
      <div>
        <Semibold className={styles.updated}>
          {t('RELEASE.LITEFARM_UPDATED', { version: APP_VERSION })}
        </Semibold>
        <Text className={styles.changes}>
          {t('SIGNUP.CHANGES')}{' '}
          <a
            href={'https://www.litefarm.org/post/an-investment-in-finances'}
            target="_blank"
            rel="noreferrer"
            className={typography.underlined}
          >
            {t('common:HERE')}
          </a>
          .
        </Text>
      </div>
    </Card>
  );
}
