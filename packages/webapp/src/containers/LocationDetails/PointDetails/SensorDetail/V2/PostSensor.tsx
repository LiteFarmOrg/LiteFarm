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
import { useTranslation } from 'react-i18next';
import { History } from 'history';
import { ContextForm, Variant } from '../../../../../components/Form/ContextForm';
import ArraysForm from './ArraysForm';
import SensorsForm from './SensorsForm';
import { arrayDefaultValues } from '../../../../../components/LocationDetailLayout/PointDetails/Sensor/V2/ArraysForm';
import { ARRAYS } from './types';

interface PostSensorProps {
  history: History;
}

const PostSensor = ({ history }: PostSensorProps) => {
  const { t } = useTranslation();

  const getFormSteps = () => [{ FormContent: ArraysForm }, { FormContent: SensorsForm }];

  const defaultFormValues = {
    [ARRAYS]: [arrayDefaultValues],
  };

  return (
    <div style={{ background: 'white' }}>
      <ContextForm
        stepperProgressBarTitle={t('SENSOR.DETAIL.ADD_SENSORS')}
        history={history}
        getSteps={getFormSteps}
        defaultFormValues={defaultFormValues}
        variant={Variant.SIMPLE_HEADER}
      />
    </div>
  );
};

export default PostSensor;
