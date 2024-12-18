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

import styles from './styles.module.scss';
import InfoBoxComponent from '../InfoBoxComponent';
import { BsChevronLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router';

export default function PageTitle({
  title,
  backUrl,
  rightIcon,
  rightIconTitle,
  rightIconBody,
  rightIconDeleteHandler,
  showDelete,
  isHarvestLogStep,
  leftButtonText,
  rightButtonText,
}) {
  let navigate = useNavigate();

  return (
    <div>
      <div
        className={isHarvestLogStep ? styles.harvestLogStepTitleContainer : styles.titleContainer}
      >
        <button
          className={styles.buttonContainer}
          onClick={() => {
            navigate(backUrl);
          }}
        >
          <BsChevronLeft style={{ fontSize: '20px' }} />
        </button>
        <div className={styles.titleTextContainer}>{title}</div>
        {rightIcon && (
          <div style={{ position: 'absolute', right: '0' }}>
            <InfoBoxComponent
              title={rightIconTitle}
              body={rightIconBody}
              deleteHandler={rightIconDeleteHandler}
              showDelete={showDelete}
              leftButtonText={leftButtonText}
              rightButtonText={rightButtonText}
            />
          </div>
        )}
      </div>
    </div>
  );
}
