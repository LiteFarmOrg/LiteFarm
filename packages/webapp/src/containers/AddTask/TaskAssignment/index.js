import PureTaskAssignment from '../../../components/AddTask/PureTaskAssignment';
import { loginSelector, userFarmEntitiesSelector, userFarmSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';

function TaskManagement({ history, match }) {
  const userFarms = useSelector(userFarmEntitiesSelector); // all user farm data - farm data and user data for each farm
  const { farm_id } = useSelector(loginSelector);
  const userFarm = useSelector(userFarmSelector);
  const users = userFarms[farm_id];
  const userData = Object.values(users); // list of data for each user ie: 0 = data for 1st user, 1 = data for 2nd user, etc...
  let options = [];
  let wage_data = [];
  const worker = users[userFarm.user_id];
  // console.log(worker);
  // console.log(userFarm);
  // console.log(userFarm.role_id);
  // console.log(userData.length);
  // console.log(users);
  // console.log(users[userFarm.user_id])
  //console.log(userData);
  if (userFarm.role_id === 3) {
    let obj = { label: worker.first_name + ' ' + worker.last_name, value: worker.user_id };
    let wageObj = {
      [worker.user_id]: { currency: worker.units.currency, hourly_wage: worker.wage.amount },
    };
    options.push(obj);
    wage_data.push(wageObj);
  } else {
    for (let i = 0; i < userData.length; i++) {
      // console.log(userData[i].wage.amount);
      // console.log(userData[i].units.currency);
      // console.log(userData[i].first_name);
      // console.log(userData[i].last_name);
      // console.log(userData[i].user_id);
      // console.log(userData[i].first_name + " " + userData[i].last_name);
      let obj = {
        label: userData[i].first_name + ' ' + userData[i].last_name,
        value: userData[i].user_id,
      };
      options.push(obj);
      let wageObj = {
        [userData[i].user_id]: {
          currency: userData[i].units.currency,
          hourly_wage: userData[i].wage.amount,
        },
      };
      wage_data.push(wageObj);
    }
  }

  // console.log(options);
  // console.log(wage_data);
  // console.log(userFarms);
  // console.log(users);
  // console.log(userData);
  // console.log(userData[1]);

  // list of {label: name, value: user_id}
  // list of {user_id: {currency: currency, hourly_wage: hourly_wage}}
  // pass both lists to TaskManagement
  const onSubmit = () => {
    console.log('onSave called');
  };
  const handleGoBack = () => {
    console.log('handleGoBack called');
  };
  const handleCancel = () => {
    console.log('handleCancel called');
  };
  const onError = () => {
    console.log('onError called');
  };
  const isFarmWorker = userFarm.role_id === 3;

  return (
    <PureTaskAssignment
      onSubmit={onSubmit}
      handleGoBack={handleGoBack}
      handleCancel={handleCancel}
      onError={onError}
      userFarmOptions={options}
      wageData={wage_data}
      isFarmWorker={isFarmWorker}
    />
  );
}

export default TaskManagement;
