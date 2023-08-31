import Card from '../index';
import { ReactComponent as Star } from '../../../assets/images/signUp/new_feature.svg';
import { Semibold, Text } from '../../Typography';
import styles from '../../Typography/typography.module.scss';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../assets/theme';

export function NewReleaseCard({ style }) {
  const { t } = useTranslation();
  return (
    <Card
      color={'info'}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        alignItems: 'center',
        padding: '16px',
        ...style,
      }}
    >
      <Star />
      <div>
        <Semibold style={{ color: colors.teal700, marginBottom: '12px', lineHeight: '20px' }}>
          {t('SIGNUP.LITEFARM_UPDATED')}
        </Semibold>
        <Text style={{ margin: 0, lineHeight: '18px' }}>
          {t('SIGNUP.CHANGES')}{' '}
          <a
            href={'https://www.litefarm.org/post/power-to-the-plans-and-people'}
            target="_blank"
            rel="noreferrer"
            className={styles.underlined}
          >
            {t('common:HERE')}
          </a>
          .
        </Text>
      </div>
    </Card>
  );
}
