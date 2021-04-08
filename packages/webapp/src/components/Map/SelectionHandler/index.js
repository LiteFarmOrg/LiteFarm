import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { pointImgDict } from '../LocationMapping';
import { lineImgDict } from '../LocationMapping';
import { areaImgDict } from '../LocationMapping';

export default function PureSelectionHandler({ locationAssetType, locationType, locationName }) {
  const [icon, setIcon] = useState(null);

  const imgMapping = () => {
    locationAssetType === 'Point'
      ? Object.keys(pointImgDict).map((item) => {
          if (pointImgDict[item].key === locationType) {
            setIcon(pointImgDict[item].icon);
            console.log(locationType);
            console.log(icon);
          }
        })
      : locationAssetType === 'Line'
      ? Object.keys(lineImgDict).map((item) => {
          if (lineImgDict[item].key === locationType) {
            setIcon(lineImgDict[item].icon);
          }
        })
      : Object.keys(areaImgDict).map((item) => {
          if (areaImgDict[item].key === locationType) {
            setIcon(areaImgDict[item].icon);
          }
        });
  };

  useEffect(() => {
    imgMapping();
  }, []);

  return (
    <div>
      <div style={{ float: 'left', marginLeft: '0px' }}> {icon} </div>
      <div style={{ padding: '2px 30px' }}>{locationName}</div>

      {/* <div className={clsx(styles.container)}>
        <div className={styles.headerText}>
          <input type="image" src={Checkmark} className={styles.button} />
          <span style={{ paddingLeft: '10px' }}>{title}</span>
        </div>
        <div style={{ paddingTop: '5px' }}>
          <input type="image" src={Cross} className={styles.button} onClick={closeSuccessHeader} />
        </div>
      </div>
      {!dismissProgressBar && <ProgressBar closeSuccessHeader={closeSuccessHeader} />} */}
    </div>
  );
}

PureSelectionHandler.prototype = {
  locationAssetType: PropTypes.string,
  locationType: PropTypes.string,
  locationName: PropTypes.string,
  //   closeSuccessHeader: PropTypes.func,
};
