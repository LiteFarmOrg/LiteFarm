import React, { useEffect, useState } from 'react';
import PureTaskAssignment from '../../../components/AddTask/PureTaskAssignment';
import { loginSelector, userFarmEntitiesSelector, userFarmSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import { getCurrencyFromStore } from '../../../util/getFromReduxStore';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TaskManagement({ history, match }) {
  const userFarms = useSelector(userFarmEntitiesSelector);
  const { farm_id } = useSelector(loginSelector);
  const userFarm = useSelector(userFarmSelector);
  const users = userFarms[farm_id];
  const userData = Object.values(users);
  const [options, setOptions] = useState([{ label: 'Unassigned', value: 'unassigned' }]);
  const [wageData, setWageData] = useState([
    { 0: { currency: null, hourly_wage: null, currencySymbol: null } },
  ]);
  const [isFarmWorker] = useState(userFarm.role_id === 3);
  const currencySymbol = grabCurrencySymbol(getCurrencyFromStore());
  const worker = users[userFarm.user_id];
  const goBackPath = '/add_task/task_notes';
  const persistPaths = [goBackPath];

  useEffect(() => {
    let wage_data = [];
    let innerOptions = [];
    if (userFarm.role_id === 3) {
      let obj = { label: worker.first_name + ' ' + worker.last_name, value: worker.user_id };
      let wageObj = {
        [worker.user_id]: {
          currency: worker.units.currency,
          hourly_wage: worker.wage.amount,
          currencySymbol: currencySymbol,
        },
      };
      innerOptions.push(obj);
      wage_data.push(wageObj);
    } else {
      for (let i = 0; i < userData.length; i++) {
        let obj = {
          label: userData[i].first_name + ' ' + userData[i].last_name,
          value: userData[i].user_id,
        };
        innerOptions.push(obj);
        let wageObj = {
          [userData[i].user_id]: {
            currency: userData[i].units.currency,
            hourly_wage: userData[i].wage.amount,
            currencySymbol: currencySymbol,
          },
        };
        wage_data.push(wageObj);
      }
    }
    setOptions(options.concat(innerOptions));
    // setOptions([{ label: 'Unassigned', value: null }].concat(innerOptions))
    //setWageData(wage_data);
    setWageData(wageData.concat(wage_data));
  }, []);

  //console.log(wageData);
  const onSubmit = () => {
    console.log('onSave called'); // todo: when POST is done
  };
  const handleGoBack = () => {
    // add goBackPath to persistPaths array
    history.push(persistPaths[0]);
  };
  const handleCancel = () => {
    // todo: when Brandon has main task management path
    console.log('handleCancel called');
  };
  const onError = () => {
    console.log('onError called');
  };
  // console.log('wageData')
  // console.log(wageData);
  // console.log('options')
  // console.log(options);
  //
  //
  // console.log('wageData length')
  // console.log(wageData.length)
  // console.log('options length')
  // console.log(options.length);

  // const optValues = Object.values(options);
  // console.log('optvalues');
  // console.log(optValues);

  return (
    <HookFormPersistProvider>
      <PureTaskAssignment
        onSubmit={onSubmit}
        handleGoBack={handleGoBack}
        handleCancel={handleCancel}
        onError={onError}
        userFarmOptions={options}
        wageData={wageData}
        isFarmWorker={isFarmWorker}
        currencySymbol={currencySymbol}
        persistPaths={persistPaths}
      />
    </HookFormPersistProvider>
  );
}

export default TaskManagement;
