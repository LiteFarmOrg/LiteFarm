import PropTypes from 'prop-types';
import FarmImageWidget from './FarmImageWidget';
import styles from './home.module.scss';

export default function PureHome({ first_name, farmName, date, imgUrl, children }) {
  return (
    <div className={styles.container}>
      <FarmImageWidget first_name={first_name} farmName={farmName} date={date} imgUrl={imgUrl} />
      {children}
    </div>
  );
}

PureHome.propTypes = {
  first_name: PropTypes.string,
  farmName: PropTypes.string,
  date: PropTypes.string,
  imgUrl: PropTypes.string,
  children: PropTypes.node,
};
