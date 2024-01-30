import { colors } from '../../../../assets/theme';
import styles from './styles.module.scss';
import MapPin from '../../../../assets/images/map/map_pin.svg';
import { Label } from '../../../Typography';
import { useTranslation } from 'react-i18next';

export function TransplantLocationLabel({ locations, selectedLocationId, pinCoordinate }) {
  const transplantLocation = locations.find(
    (location) => location.location_id === selectedLocationId,
  );
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.labelContainer}>
        <Label>{t('TASK.CURRENT')}:</Label>{' '}
        <CurrentLocationIcon
          locations={locations}
          selectedLocationId={selectedLocationId}
          pinCoordinate={pinCoordinate}
        />
      </div>
      <div className={styles.labelContainer}>
        <Label>{t('TASK.TRANSPLANT')}:</Label>
        <AreaIcon location={transplantLocation} isTransplantLocation />
      </div>
    </div>
  );
}

function AreaIcon({ isTransplantLocation, location }) {
  const locationTypeColorMap = {
    field: colors.brown900,
    garden: colors.grey600,
    buffer_zone: colors.yellow700,
    greenhouse: colors.brightGreen700,
  };
  const color = locationTypeColorMap[location.type];
  return (
    <div
      className={styles.square}
      style={{ borderColor: color, backgroundColor: isTransplantLocation ? undefined : color }}
    />
  );
}

function CurrentLocationIcon({ locations, selectedLocationId, pinCoordinate }) {
  if (pinCoordinate) return <MapPin className={styles.pin} />;
  const location =
    locations.find((location) => location.location_id !== selectedLocationId) || locations[0];
  return <AreaIcon location={location} />;
}
