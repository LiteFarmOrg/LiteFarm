/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
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
import { useState } from 'react';
import Map from '../../../../Map';
import { useSelector } from 'react-redux';
import PureArraysForm from '../../../../../components/LocationDetailLayout/PointDetails/Sensor/V2/ArraysForm';
import { fieldsSelector } from '../../../../fieldSlice';

interface ArraysFormProps {
  history: History;
  isCompactSideMenu: boolean;
}

const ArraysForm = ({ history, isCompactSideMenu }: ArraysFormProps) => {
  const [showMap, setShowMap] = useState(false);

  const fields = useSelector(fieldsSelector);

  const onPlaceOnMapClick = () => {
    setShowMap(true);
  };

  return (
    <>
      {showMap && <Map history={history} isCompactSideMenu={isCompactSideMenu} />}
      <PureArraysForm onPlaceOnMapClick={onPlaceOnMapClick} fields={fields} />
    </>
  );
};

export default ArraysForm;
