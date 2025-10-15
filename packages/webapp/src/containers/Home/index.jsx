import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import FarmSwitchOutro from '../FarmSwitchOutro';
import {
  chooseFarmFlowSelector,
  endExportModal,
  endSwitchFarmModal,
  switchFarmSelector,
} from '../ChooseFarm/chooseFarmFlowSlice';

import PreparingExportModal from '../../components/Modals/PreparingExportModal';
import { getAlert } from '../Navigation/Alert/saga.js';
import useMediaWithAuthentication from '../hooks/useMediaWithAuthentication';
import { useGetSensorsQuery } from '../../store/api/apiSlice';
import { makeSelectValueByKey, valueByKeySelector } from './homeSlice';

const SmallComponent = ({ id }) => {
  const [counter, setCounter] = useState(0);
  const [key, setKey] = useState(null);

  // const selectorCreatedInComponent = makeSelectValueByKey();
  // const value = useSelector((state) => selectorCreatedInComponent(state, key));

  const memoizedSelector = useMemo(() => makeSelectValueByKey(), []);
  const value = useSelector((state) => memoizedSelector(state, key));

  // const value = useSelector((state) => valueByKeySelector(state, key));

  return (
    <div
      style={{
        border: 'solid 1px #000',
        fontSize: 20,
        fontWeight: 'bold',
        padding: 20,
      }}
    >
      <b>
        Component {id}: {value}
      </b>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <span>{counter}</span>
        <button onClick={() => setCounter((prev) => prev + 1)}>+</button>
        <span>{`(triggers re-render)`}</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <span>key:</span>
        <button onClick={() => setKey(1)}>1</button>
        <button onClick={() => setKey(2)}>2</button>
        <button onClick={() => setKey(3)}>3</button>
        <button onClick={() => setKey(4)}>4</button>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div>
      <div>
        <b>Redux store </b>
        <code>{`{ values: { 1: 10, 2: 20, 3: 30, 4: 40 } }`}</code>
      </div>
      <div>
        <b>Selector </b>
        <code>{`(key) => values[key]`}</code>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SmallComponent id={1} />
        <SmallComponent id={2} />
        <SmallComponent id={3} />
        <SmallComponent id={4} />
        <ol>
          <li>Selector</li>
          <li>Selector factory without useMemo</li>
          <li>Selector factory with useMemo</li>
        </ol>
      </div>
    </div>
  );
}
