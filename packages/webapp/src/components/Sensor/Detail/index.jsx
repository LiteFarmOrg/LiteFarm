import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';

export default function PureSensorDetail({ history }) {
  const { t } = useTranslation();
  const styles = {
    buttonContainer: {
      display: 'flex',
    },
    leftButton: {
      float: 'right',
    },
    rightButton: {
      float: 'right',
    },
  };

  return (
    <div>
      <div className={'Detail Options'} style={styles.buttonContainer}>
        <Button
          type={'submit'}
          onClick={() => history.push('/retire_sensor')} // Change accordingly
          color={'secondary'}
          style={styles.leftButton}
        >
          {t(`SENSOR.DETAIL.RETIRE`)}
        </Button>

        <Button
          type={'submit'}
          onClick={() => history.push('/edit_sensor')} // Change accordingly
          style={styles.rightButton}
        >
          {t(`SENSOR.DETAIL.EDIT`)}
        </Button>
      </div>
    </div>
  );
}
